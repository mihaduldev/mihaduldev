-- Replace the original 3 seed posts with deep, example-rich ones (.NET DI, Flutter, advanced C#).
DELETE FROM posts WHERE slug IN ('clean-architecture-dotnet', 'ship-dotnet-with-docker-ci', 'practical-llm-workflows', 'dependency-injection-in-dotnet', 'advanced-csharp-features', 'flutter-state-management');

INSERT INTO posts (slug, title, excerpt, body_md, tags_json, cover, reading_time, published, published_at, updated_at)
VALUES ('dependency-injection-in-dotnet', 'Dependency Injection in .NET: Lifetimes, Pitfalls, and the Options Pattern', 'A practical, senior-level walkthrough of .NET''s built-in DI container — service lifetimes, the captive dependency trap, keyed services, the Options pattern, and testing.', 'Dependency injection is one of those topics where everybody "knows" it but a surprising number of production bugs trace back to getting it subtly wrong. Most teams I join can register a service behind an interface, but they can''t tell me why their `DbContext` is throwing `ObjectDisposedException` under load, or why a config value never updates. This post is the deep version: the built-in container, the three lifetimes and when each is correct, the traps that actually bite, and how to keep all of it testable.

## The built-in container is enough

For years the reflexive move was to reach for Autofac or Castle Windsor. In modern .NET (`Microsoft.Extensions.DependencyInjection`) you rarely need to. The built-in container does constructor injection, lifetimes, keyed services, and factory registration. Reach for a third-party container only when you genuinely need property injection, interception, or assembly scanning conventions — and most apps never do.

Everything starts in `Program.cs`. You register services against the `IServiceCollection`, the host builds an `IServiceProvider`, and from then on the container hands you fully-constructed graphs.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();
```

## Constructor injection is the only injection you want

Declare your dependencies as constructor parameters and store them in `readonly` fields. That''s it. No service locator, no `IServiceProvider` smuggled into business logic, no static `ServiceLocator.Resolve<T>()`.

```csharp
public sealed class OrderService
{
    private readonly IOrderRepository _repository;
    private readonly IEmailSender _email;
    private readonly IClock _clock;

    public OrderService(IOrderRepository repository, IEmailSender email, IClock clock)
    {
        _repository = repository;
        _email = email;
        _clock = clock;
    }

    public async Task PlaceAsync(Order order, CancellationToken ct)
    {
        order.PlacedAt = _clock.UtcNow;
        await _repository.AddAsync(order, ct);
        await _email.SendAsync(order.CustomerEmail, "Order confirmed", ct);
    }
}
```

> Constructor injection makes dependencies honest. If a class takes nine constructor parameters, the constructor is telling you the class does nine things. Listen to it and split the class — don''t hide the dependencies behind a service locator.

In .NET 8 you can lean on the framework''s primary constructors to cut boilerplate, but keep the fields explicit when the class is non-trivial.

## The three lifetimes — and when each is right

This is where most of the real bugs live. There are exactly three lifetimes:

- **Transient** — a new instance every time it''s resolved. Use for lightweight, stateless services. Cheap to create, no shared state.
- **Scoped** — one instance per scope. In ASP.NET Core a scope equals an HTTP request, so a scoped service is shared across everything handling that one request. This is the correct lifetime for `DbContext`, unit-of-work, and per-request caches.
- **Singleton** — one instance for the entire application lifetime. Use for genuinely stateless, thread-safe services, or for expensive-to-build, immutable state (config, an `HttpClient` factory, an in-memory cache).

The defaults that matter: register your `DbContext` as Scoped (`AddDbContext` does this for you), register anything that holds per-request state as Scoped, and reserve Singleton for things that are either immutable or internally thread-safe.

A concrete decision: `IClock`? Singleton — it has no state, just reads `DateTime.UtcNow`. `IOrderRepository` wrapping a `DbContext`? Scoped — it must share the request''s `DbContext`. A throwaway `MailMessage` builder? Transient.

## The captive dependency trap

Here is the bug I see most. You inject a **Scoped** service into a **Singleton**. The singleton is created once and captures that scoped instance forever — it becomes a "captive dependency." Now your per-request `DbContext` lives for the whole application lifetime, shared across every concurrent request. You get torn reads, `ObjectDisposedException`, and concurrency exceptions that are maddening to reproduce.

```csharp
// WRONG: AppDbContext is Scoped, captured by a Singleton.
public sealed class CacheWarmer
{
    private readonly AppDbContext _db; // captured forever
    public CacheWarmer(AppDbContext db) => _db = db;
}

builder.Services.AddSingleton<CacheWarmer>(); // boom, eventually
```

The right fix is to inject `IServiceScopeFactory` and create a fresh scope each time you need the scoped service:

```csharp
public sealed class CacheWarmer
{
    private readonly IServiceScopeFactory _scopeFactory;
    public CacheWarmer(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

    public async Task WarmAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var count = await db.Products.CountAsync(ct);
        // use db only inside this scope; it''s disposed when the scope ends
    }
}
```

**How to detect it before production:** the container can validate the entire graph at build time. Turn on scope validation — in Development it''s on by default, but force it everywhere so CI catches it:

```csharp
builder.Host.UseDefaultServiceProvider((context, options) =>
{
    options.ValidateScopes = true;   // throws on captive dependencies
    options.ValidateOnBuild = true;  // validates the whole graph at startup
});
```

With `ValidateOnBuild`, a captive dependency throws at startup with a clear message instead of failing intermittently at 3am.

## The Options pattern: stop injecting IConfiguration

Injecting `IConfiguration` and calling `config["Section:Key"]` everywhere is a code smell. Bind a strongly-typed options class instead. You get validation, type safety, and a single place that knows the shape of your config.

```csharp
public sealed class SmtpOptions
{
    public const string Section = "Smtp";

    [Required] public string Host { get; init; } = string.Empty;
    [Range(1, 65535)] public int Port { get; init; } = 587;
    public string FromAddress { get; init; } = string.Empty;
}
```

```csharp
builder.Services
    .AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection(SmtpOptions.Section))
    .ValidateDataAnnotations()
    .ValidateOnStart(); // fail fast at startup if config is invalid
```

Now consume it. The accessor you choose matters:

- `IOptions<T>` — Singleton, computed once. Fine for config that never changes at runtime.
- `IOptionsSnapshot<T>` — Scoped, recomputed per request. Use when `appsettings.json` changes should be picked up (reloadable config) within an injectable scope.
- `IOptionsMonitor<T>` — Singleton with change notifications. Use inside singletons or background services that need live updates.

```csharp
public sealed class SmtpEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;

    // IOptionsSnapshot picks up config reloads per request.
    public SmtpEmailSender(IOptionsSnapshot<SmtpOptions> options)
        => _options = options.Value;

    public Task SendAsync(string to, string subject, CancellationToken ct)
    {
        using var client = new SmtpClient(_options.Host, _options.Port);
        // ...
        return Task.CompletedTask;
    }
}
```

Note the lifetime trap returns here: you cannot inject `IOptionsSnapshot<T>` (Scoped) into a Singleton. Use `IOptionsMonitor<T>` there instead — `monitor.CurrentValue` gives you the current snapshot without capturing a scope.

## Keyed services in .NET 8

Before .NET 8, registering two implementations of the same interface and choosing between them at runtime meant a hand-rolled factory. Keyed services make it first-class.

```csharp
builder.Services.AddKeyedSingleton<IPaymentGateway, StripeGateway>("stripe");
builder.Services.AddKeyedSingleton<IPaymentGateway, PayPalGateway>("paypal");
```

Resolve by key with the `[FromKeyedServices]` attribute in constructors or minimal API handlers:

```csharp
app.MapPost("/pay/{provider}", async (
    string provider,
    [FromKeyedServices("stripe")] IPaymentGateway stripe,
    PaymentRequest request) =>
{
    var result = await stripe.ChargeAsync(request);
    return Results.Ok(result);
});
```

When the key is dynamic, resolve through `IServiceProvider`:

```csharp
public sealed class PaymentRouter(IServiceProvider provider)
{
    public IPaymentGateway Resolve(string providerName) =>
        provider.GetRequiredKeyedService<IPaymentGateway>(providerName);
}
```

## Factory registration and runtime resolution

Sometimes construction needs logic the container can''t infer — reading config, picking an implementation, wiring a third-party SDK. Register a factory delegate:

```csharp
builder.Services.AddSingleton<IBlobStore>(sp =>
{
    var opts = sp.GetRequiredService<IOptions<StorageOptions>>().Value;
    var logger = sp.GetRequiredService<ILogger<AzureBlobStore>>();
    return opts.UseLocalDisk
        ? new LocalDiskBlobStore(opts.LocalPath, logger)
        : new AzureBlobStore(opts.ConnectionString, logger);
});
```

For "give me a fresh instance on demand," inject a `Func<T>` factory rather than the service directly:

```csharp
builder.Services.AddTransient<ReportJob>();
builder.Services.AddSingleton<Func<ReportJob>>(sp => sp.GetRequiredService<ReportJob>);
```

## Testing: the whole point of DI

The payoff for all this discipline is trivial substitution in tests. Because everything arrives through the constructor, your unit tests never touch the container at all — just `new` the class with fakes.

```csharp
[Fact]
public async Task PlaceAsync_sets_timestamp_and_sends_email()
{
    var repo = Substitute.For<IOrderRepository>();
    var email = Substitute.For<IEmailSender>();
    var clock = new FakeClock(new DateTime(2026, 6, 16, 9, 0, 0, DateTimeKind.Utc));

    var sut = new OrderService(repo, email, clock);
    var order = new Order { CustomerEmail = "a@b.com" };

    await sut.PlaceAsync(order, CancellationToken.None);

    Assert.Equal(clock.UtcNow, order.PlacedAt);
    await email.Received(1).SendAsync("a@b.com", "Order confirmed", Arg.Any<CancellationToken>());
}
```

For integration tests against the real graph, replace a single registration in `WebApplicationFactory`. `Remove` the real service, then add the fake — `AddScoped` alone won''t win because the last registration only wins for `GetService`, not for replacing in place.

```csharp
public sealed class TestAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IEmailSender>();
            services.AddSingleton<IEmailSender, NoOpEmailSender>();
        });
    }
}
```

## Common pitfalls

- **Captive dependencies** — Scoped (or Transient) injected into Singleton. Catch it with `ValidateScopes` + `ValidateOnBuild`.
- **Injecting `IServiceProvider` into business logic** — that''s the service locator anti-pattern in disguise. Keep the provider in composition roots, factories, and background services only.
- **Transient `IDisposable` registered in the root scope** — if you resolve a transient `IDisposable` from the root provider, the container holds it until the app shuts down (a memory leak). Resolve disposables inside a scope.
- **`AddScoped` for a `DbContext` accessed from a singleton hosted service** — same captive trap; use `IServiceScopeFactory`.
- **Re-binding options after the host is built** — options are bound at registration time; mutating config objects afterward does nothing.
- **Assuming last-registration-wins for everything** — it wins for single resolution, but `GetServices<T>()` returns *all* registrations. Use `RemoveAll` then add when you mean to replace.

## Takeaway

DI in .NET isn''t about a clever container — it''s about discipline. Inject through constructors, pick the lifetime deliberately (Scoped for per-request state, Singleton for immutable/thread-safe, Transient for cheap stateless), and let `ValidateOnBuild` fail loudly when you get it wrong. Bind config with the Options pattern, use keyed services and factories when you need runtime choice, and your tests will write themselves. Get the lifetimes right and 90% of the "spooky action at a distance" bugs simply stop happening.', '["dotnet","csharp","dependency-injection","aspnetcore","architecture"]', 'from-[#512BD4] to-[#087EA4]', '11 min read', 1, '2026-06-10', unixepoch());

INSERT INTO posts (slug, title, excerpt, body_md, tags_json, cover, reading_time, published, published_at, updated_at)
VALUES ('advanced-csharp-features', 'Advanced C# 12 Features That Earn Their Keep in Production', 'A working tour of the modern C# features I actually reach for — pattern matching, records, nullable done right, Span, async streams — with real before/after code.', 'I''ve been writing C# professionally for over a decade, and the language I write today barely resembles the C# of the .NET Framework days. The features that landed in C# 9 through 12 aren''t syntax sugar — they change how I model data, how I write hot paths, and how I reason about null. Here are the ones that have earned a permanent spot in my toolbox, each with the concrete before/after that made me a believer.

## Pattern matching: stop writing if-ladders

The single biggest readability win in modern C# is switch expressions combined with property, positional, and list patterns. The old way buries your intent under control-flow noise.

Here''s the kind of code I used to write and the kind I write now:

```csharp
// Before: imperative, easy to get the fall-through wrong
public decimal CalculateShipping(Order order)
{
    if (order.Total > 100m)
        return 0m;
    if (order.Country == "US" && order.Weight < 5)
        return 5.99m;
    if (order.Country == "US")
        return 12.99m;
    return 24.99m;
}

// After: a switch expression reads top-to-bottom like a spec
public decimal CalculateShipping(Order order) => order switch
{
    { Total: > 100m }                        => 0m,
    { Country: "US", Weight: < 5 }           => 5.99m,
    { Country: "US" }                         => 12.99m,
    _                                          => 24.99m,
};
```

Property patterns (`{ Country: "US" }`) let you destructure and test in one move. The compiler also warns you when a switch expression isn''t exhaustive, which catches a whole class of "oops, forgot that case" bugs at compile time.

Positional patterns shine on records and tuples. List patterns (C# 11) are the newest piece — they let you match the *shape* of a sequence:

```csharp
public record Point(int X, int Y);

public string Classify(Point p) => p switch
{
    (0, 0)            => "origin",
    (var x, 0)        => $"on X axis at {x}",
    (0, var y)        => $"on Y axis at {y}",
    var (x, y)        => $"({x}, {y})",
};

// List patterns: parse a command without a tokenizer
public string Route(string[] args) => args switch
{
    []                       => "no command",
    ["help"]                 => ShowHelp(),
    ["deploy", var env]      => Deploy(env),
    ["deploy", var env, ..]  => Deploy(env), // extra args ignored
    [var cmd, ..]            => $"unknown command: {cmd}",
};
```

That `..` is the slice pattern — it matches zero or more elements. You can bind it too (`[var first, .. var rest]`) when you need the tail.

> Pattern matching isn''t about being clever. It''s about making the compiler verify that you''ve handled every shape your data can take.

## Records: value semantics without the boilerplate

Before records, an immutable value object meant a constructor, read-only properties, a hand-written `Equals`, a `GetHashCode` you''d inevitably get wrong, and a `ToString`. Records collapse all of that into one line.

```csharp
// Before: ~40 lines of ceremony, and the Equals/GetHashCode drift over time
public sealed class Money
{
    public decimal Amount { get; }
    public string Currency { get; }
    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }
    public override bool Equals(object? obj) =>
        obj is Money m && m.Amount == Amount && m.Currency == Currency;
    public override int GetHashCode() => HashCode.Combine(Amount, Currency);
    // ...ToString, copy method, etc.
}

// After
public sealed record Money(decimal Amount, string Currency);
```

You get value equality (two `Money` instances are equal if their fields are), a sensible `ToString`, and deconstruction for free. The killer feature is `with`-expressions for non-destructive mutation:

```csharp
var price = new Money(19.99m, "USD");
var discounted = price with { Amount = 14.99m };

Console.WriteLine(price);       // Money { Amount = 19.99, Currency = USD }
Console.WriteLine(discounted);  // Money { Amount = 14.99, Currency = USD }
Console.WriteLine(price == new Money(19.99m, "USD")); // True — value equality
```

This is exactly the model you want for DTOs, domain value objects, and events — anything that should be compared by content rather than identity. Reach for `record struct` when the type is small and you want stack allocation with the same value semantics.

## Nullable reference types, done right

Nullable reference types (NRTs) are the feature people enable, get a wall of warnings, and then half-disable with `!` everywhere. Done properly, they push null-handling to your boundaries instead of scattering null checks through your whole codebase.

First, turn it on project-wide, not file-by-file:

```xml
<PropertyGroup>
  <Nullable>enable</Nullable>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>
```

The mental model: `string` means *never null*, `string?` means *might be null*. The compiler does flow analysis to enforce it.

```csharp
// Wrong: the null-forgiving operator is a lie you tell the compiler
public User GetUser(string id)
{
    var user = _repo.Find(id); // returns User?
    return user!;              // crashes at runtime if null — you just hid the bug
}

// Right: handle the null at the boundary, return a non-null guarantee
public User GetUser(string id)
{
    return _repo.Find(id)
        ?? throw new UserNotFoundException(id);
}
```

The payoff is that *callers* of `GetUser` never have to null-check, because the signature promises a non-null `User`. Use `!` only when you genuinely know more than the compiler (e.g. after a `TryParse` you''ve already validated), and leave a comment when you do. For library authors, the nullability attributes are worth knowing:

```csharp
// Tells the compiler: if this returns true, ''result'' is non-null
public bool TryGetValue(string key, [NotNullWhen(true)] out string? result)
{
    result = _cache.GetValueOrDefault(key);
    return result is not null;
}
```

## Span<T> and Memory<T>: slicing without allocating

This is where C# competes with C for performance. `Span<T>` is a window over contiguous memory — an array, a stack buffer, a slice of a string — with zero copying. The classic win is parsing.

```csharp
// Before: Split allocates a string[] plus a string per segment.
// On a hot path parsing millions of lines, this is death by GC.
public (int Year, int Month, int Day) ParseDate(string input)
{
    var parts = input.Split(''-'');
    return (int.Parse(parts[0]), int.Parse(parts[1]), int.Parse(parts[2]));
}

// After: ReadOnlySpan<char> slicing allocates nothing.
public (int Year, int Month, int Day) ParseDate(ReadOnlySpan<char> input)
{
    int first = input.IndexOf(''-'');
    int second = input[(first + 1)..].IndexOf(''-'') + first + 1;

    int year  = int.Parse(input[..first]);
    int month = int.Parse(input[(first + 1)..second]);
    int day   = int.Parse(input[(second + 1)..]);
    return (year, month, day);
}
```

`int.Parse` and friends all have span overloads, so the whole pipeline stays allocation-free. The catch: `Span<T>` is a `ref struct`, so it lives on the stack and **cannot** cross an `await`, be stored in a field, or be captured in a lambda. When you need those — say, an async method that holds a buffer — use `Memory<T>`, which is heap-friendly, and call `.Span` only inside synchronous regions.

```csharp
public async Task ProcessAsync(Memory<byte> buffer, Stream source)
{
    int read = await source.ReadAsync(buffer);   // Memory<T> survives the await
    Parse(buffer.Span[..read]);                    // get the Span synchronously
}
```

For temporary buffers, `stackalloc` into a `Span` avoids the heap entirely:

```csharp
Span<char> buffer = stackalloc char[16];
bool ok = value.TryFormat(buffer, out int written);
```

## IAsyncEnumerable: streaming without buffering the world

When you''re pulling data that arrives over time — paged API results, a database cursor, a message queue — `IAsyncEnumerable<T>` lets you `await foreach` items as they land instead of materializing the whole set into a `List<T>` first.

```csharp
// Before: caller waits for ALL pages, holds everything in memory
public async Task<List<Repo>> GetAllReposAsync()
{
    var all = new List<Repo>();
    int page = 1;
    while (true)
    {
        var batch = await _api.GetReposAsync(page++);
        if (batch.Count == 0) break;
        all.AddRange(batch);
    }
    return all;
}

// After: yield each item as it arrives; the caller starts work immediately
public async IAsyncEnumerable<Repo> GetAllReposAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 1;
    while (!ct.IsCancellationRequested)
    {
        var batch = await _api.GetReposAsync(page++, ct);
        if (batch.Count == 0) yield break;
        foreach (var repo in batch)
            yield return repo;
    }
}

// Consumption — flows cancellation through with WithCancellation
await foreach (var repo in GetAllReposAsync().WithCancellation(ct))
{
    Console.WriteLine(repo.FullName);
}
```

That `[EnumeratorCancellation]` attribute is the part people forget — it wires the token from `WithCancellation` into your method''s `ct` parameter. EF Core exposes `AsAsyncEnumerable()` on queries for exactly this pattern, so you can stream rows without `ToListAsync()` pulling the whole table.

## A couple of LINQ power-moves

C# 13''s `params Span<T>` and the older `MoreEnumerable` tricks aside, two built-ins quietly removed a lot of my custom code. `Chunk` batches a sequence — perfect for bulk inserts or rate-limited API calls:

```csharp
foreach (var batch in userIds.Chunk(100))
{
    await _api.BulkUpdateAsync(batch); // 100 ids per call
}
```

And `CountBy`/`AggregateBy` (.NET 9) do grouped aggregation in one pass without the intermediate `GroupBy` allocations:

```csharp
// Before
var counts = logs.GroupBy(l => l.Level)
                 .ToDictionary(g => g.Key, g => g.Count());

// After — single pass, no group objects
var counts = logs.CountBy(l => l.Level);
```

## Common pitfalls

A few traps I''ve watched teams fall into:

- **Records aren''t deeply immutable.** `record` with a `List<T>` property is still mutable through that list — value equality compares the *reference*, not the contents. Use immutable collections if you need true immutability.
- **`Span<T>` escaping its scope.** The compiler stops most of this, but `stackalloc` in a loop will blow the stack. Allocate the buffer once, outside the loop.
- **`!` as a warning silencer.** Every `!` is a runtime `NullReferenceException` waiting to happen. If you''re writing a lot of them, your nullability annotations are wrong somewhere upstream — fix the source.
- **`IAsyncEnumerable` without cancellation.** A streaming method that ignores cancellation is a hung request waiting to happen. Always plumb the token.
- **Switch expressions with side effects.** They''re expressions — keep them pure. If each arm needs to run statements, you want a switch statement, not an expression.

## Takeaway

None of these features are about looking smart. Pattern matching makes the compiler prove your logic is exhaustive. Records make value semantics correct by default. NRTs move null to the edges. `Span<T>` deletes allocations from your hot paths. `IAsyncEnumerable` streams instead of buffering. Learn them well enough that the *old* way starts to look like the clever-but-wrong version — that''s when they''ve actually paid off.
', '["csharp","dotnet","performance","language-features"]', 'from-[#58C4DC] to-[#61DAFB]', '11 min read', 1, '2026-05-20', unixepoch());

INSERT INTO posts (slug, title, excerpt, body_md, tags_json, cover, reading_time, published, published_at, updated_at)
VALUES ('flutter-state-management', 'Flutter State Management, From setState to Riverpod', 'A practical walk through Flutter state management — the rebuild model, setState, lifting state, InheritedWidget, Provider, and Riverpod — with real Dart examples.', 'State management is where most Flutter apps quietly go wrong. Not in a way that crashes — in a way where the codebase slowly turns into a knot of `setState` calls and constructor-drilled callbacks that nobody wants to touch. I''ve shipped enough Flutter to have made every one of these mistakes, so let me walk you through the model from the ground up and land on what I actually reach for today.

The whole thing makes more sense once you understand *why* each tool exists. So we''ll go in order: what state even is, `setState`, lifting state up, why `InheritedWidget` had to be invented, then Provider, then Riverpod.

## What "state" and "rebuild" actually mean

State is just data that can change while your app is running and that the UI needs to reflect. A counter value, a logged-in user, the contents of a cart. That''s it.

The part people get wrong is the rebuild model. In Flutter, you don''t mutate widgets — widgets are immutable configuration. When state changes, Flutter throws away the old widget *descriptions* and calls `build()` again to get new ones, then diffs them against the existing element tree and only touches the render objects that actually changed.

> Calling `build()` is cheap. Rebuilding a `Widget` is not the same as repainting pixels. The expensive part is when a rebuild cascades into a huge subtree that didn''t need to change.

That last sentence is the whole game. Every state management decision you make is really a decision about *how small you can keep the rebuild*.

## setState: correct for local state, and that''s fine

For state that lives and dies inside a single widget, `setState` is the right answer. Don''t let anyone shame you out of it.

```dart
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  void _increment() {
    setState(() => _count++);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(''Counter'')),
      body: Center(child: Text(''$_count'', style: const TextStyle(fontSize: 48))),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

`setState` does one thing: it marks this `State` object dirty so Flutter re-runs *its* `build()` on the next frame. The mutation has to happen inside the closure — well, it has to happen before the frame, but putting it in the closure is the convention that keeps you honest. The trap is treating `setState` as "the way to update the UI" rather than "the way to update *this widget''s local* UI." The moment two widgets need the same value, `setState` stops being enough.

## Lifting state up (and where it falls apart)

Say the counter value needs to show in the `AppBar` *and* a button elsewhere needs to reset it. The React-style answer is to lift the state to the nearest common ancestor and pass it down.

```dart
class CounterScreen extends StatefulWidget {
  const CounterScreen({super.key});
  @override
  State<CounterScreen> createState() => _CounterScreenState();
}

class _CounterScreenState extends State<CounterScreen> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CountLabel(count: _count),
        ResetButton(onReset: () => setState(() => _count = 0)),
        IncrementButton(onTap: () => setState(() => _count++)),
      ],
    );
  }
}
```

This works, and for shallow trees it''s genuinely fine. The problem is depth. When `CountLabel` lives five widgets down, you end up threading `count` and `onTap` through every intermediate constructor — widgets that don''t care about the counter at all. That''s "prop drilling," and it makes refactoring miserable. You also rebuild the *entire* `Column` on every increment, even the parts that never read `_count`.

## Why InheritedWidget exists

The framework''s answer to prop drilling is `InheritedWidget`: a widget that sits high in the tree and lets descendants read its data directly via `context`, without anyone passing it down manually. This is the primitive that everything else — including Provider — is built on.

```dart
class CounterScope extends InheritedWidget {
  const CounterScope({
    super.key,
    required this.count,
    required super.child,
  });

  final int count;

  static CounterScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CounterScope>();
    assert(scope != null, ''No CounterScope found in context'');
    return scope!;
  }

  @override
  bool updateShouldNotify(CounterScope oldWidget) => count != oldWidget.count;
}
```

The magic is `dependOnInheritedWidgetOfExactType`. When a widget calls it, Flutter registers that widget as a dependent, and `updateShouldNotify` decides whether dependents get rebuilt when the inherited widget is replaced. Read it any deeper in the tree with `CounterScope.of(context).count` and you never pass it through a constructor.

`InheritedWidget` is powerful but raw — it gives you *propagation*, not *mutation*. You still need something holding the mutable state above it. Writing that boilerplate by hand for every piece of state is exactly the gap Provider and Riverpod fill.

## Provider: ChangeNotifier with ergonomics

Provider is a thin, well-designed wrapper over `InheritedWidget`. The common pattern pairs it with `ChangeNotifier` — a built-in class that holds state and calls `notifyListeners()` when it changes.

```dart
class CartModel extends ChangeNotifier {
  final List<String> _items = [];
  List<String> get items => List.unmodifiable(_items);
  int get count => _items.length;

  void add(String item) {
    _items.add(item);
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
```

Provide it once near the top of the tree, then read it wherever you need it:

```dart
ChangeNotifierProvider(
  create: (_) => CartModel(),
  child: const ShopApp(),
);
```

```dart
class CartBadge extends StatelessWidget {
  const CartBadge({super.key});

  @override
  Widget build(BuildContext context) {
    // Rebuilds whenever notifyListeners() fires.
    final count = context.watch<CartModel>().count;
    return Badge(label: Text(''$count''), child: const Icon(Icons.shopping_cart));
  }
}
```

Two things worth internalizing. `context.watch<T>()` subscribes — the widget rebuilds on change. `context.read<T>()` does *not* subscribe — use it inside callbacks like `onPressed` where you just want to fire a method:

```dart
ElevatedButton(
  onPressed: () => context.read<CartModel>().add(''Coffee''),
  child: const Text(''Add to cart''),
);
```

Mixing these up is the single most common Provider bug. Calling `read` in `build` and expecting reactivity, or calling `watch` inside a callback (which throws), trips up everyone at least once.

## Riverpod: the modern choice

Provider''s biggest weakness is that it''s tied to the widget tree and `BuildContext`. You can''t read a provider without a context, you can get runtime `ProviderNotFoundException`s, and testing means pumping widgets. Riverpod — from the same author — fixes all of that by moving providers *out* of the tree into a global, compile-safe graph. With code generation it''s the cleanest option in 2026.

```dart
import ''package:flutter_riverpod/flutter_riverpod.dart'';
import ''package:riverpod_annotation/riverpod_annotation.dart'';

part ''cart.g.dart'';

@riverpod
class Cart extends _$Cart {
  @override
  List<String> build() => [];

  void add(String item) => state = [...state, item];
  void clear() => state = [];
}
```

Wrap the app in a `ProviderScope`, then consume with a `ConsumerWidget`:

```dart
class CartBadge extends ConsumerWidget {
  const CartBadge({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartProvider).length;
    return Badge(label: Text(''$count''), child: const Icon(Icons.shopping_cart));
  }
}
```

```dart
ElevatedButton(
  onPressed: () => ref.read(cartProvider.notifier).add(''Coffee''),
  child: const Text(''Add to cart''),
);
```

State is immutable — you replace it via `state = ...` rather than mutating in place, which makes change detection trivial. Async is first-class too; an `AsyncNotifier` returns `AsyncValue<T>` and you pattern-match the loading/error/data states without any manual `bool isLoading` flags:

```dart
@riverpod
Future<User> currentUser(Ref ref) async {
  final repo = ref.watch(userRepositoryProvider);
  return repo.fetchMe();
}
```

```dart
ref.watch(currentUserProvider).when(
  data: (user) => Text(user.name),
  loading: () => const CircularProgressIndicator(),
  error: (e, _) => Text(''Failed: $e''),
);
```

## Avoiding unnecessary rebuilds

This is where teams either keep performance or lose it. The principle is the same everywhere: **subscribe to the smallest slice of state you can.**

In Provider, scope rebuilds with `Consumer` so only the part inside it rebuilds, and use `select` to watch a single field:

```dart
// Only rebuilds when `count` changes — not when other CartModel fields do.
final count = context.select<CartModel, int>((cart) => cart.count);
```

Riverpod has the same idea with `select`:

```dart
// This widget rebuilds only when the list length changes.
final count = ref.watch(cartProvider.select((items) => items.length));
```

The wrong way, which I see constantly:

```dart
// BAD: watches the whole object, rebuilds on any change,
// even when the widget only displays the count.
final cart = context.watch<CartModel>();
return Text(''${cart.count}'');
```

If that `Text` sits at the top of a screen, every cart mutation rebuilds the whole screen. Wrap reactive bits in their own small widgets, use `select`, and keep `const` constructors on anything static so Flutter can skip it entirely.

## Common pitfalls

- **Reaching for global state too early.** If state is local, keep it local with `setState`. A `ChangeNotifier` for a value one widget uses is over-engineering.
- **`context.watch` inside `initState` or callbacks.** `watch` only belongs in `build`. For one-off reads, use `read`.
- **Mutating a list/map in place with `ChangeNotifier` and forgetting `notifyListeners()`.** No notify, no rebuild. With Riverpod''s immutable `state =` you can''t make this mistake.
- **Putting business logic in widgets.** Your `Notifier`/`ChangeNotifier` should be testable without a single widget. If you can''t unit-test it, it''s in the wrong place.
- **Disposing manually that you don''t need to.** Riverpod auto-disposes providers when nothing watches them (with `autoDispose` / code-gen defaults). Don''t fight it with manual lifecycle code.

## Which one should I use

Here''s my actual decision guide, no hedging:

- **State lives in one widget?** `setState`. Stop reading.
- **Shared by a couple of nearby widgets, shallow tree?** Lift state up.
- **New app, anything non-trivial?** Riverpod with code generation. Compile-safe, testable without the tree, great async support. This is my default.
- **Existing Provider codebase?** Stay on Provider — it''s still solid. Don''t rewrite working code for fashion. Migrate incrementally if you want Riverpod''s testing wins.
- **`InheritedWidget` directly?** Almost never by hand — but understand it, because it''s what your tools are built on and it explains every rebuild you''ll ever debug.

## Takeaway

State management isn''t about picking the trendiest package — it''s about controlling *what rebuilds when*. Learn the rebuild model first, keep local state local, and scope your subscriptions tightly with `select`. When you outgrow `setText`-style local state, reach for Riverpod and let the compiler catch your mistakes instead of your users.', '["flutter","dart","state-management","riverpod","provider"]', 'from-[#0052CC] to-[#3178C6]', '11 min read', 1, '2026-04-28', unixepoch());
