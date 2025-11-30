using Asp.Versioning;
using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using Makayen.Infrastructure.Identity;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using quiz_management_system.Application.Common.Behaivors;
using quiz_management_system.Application.Common.Settings;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Infrastructure.Data;
using quiz_management_system.Infrastructure.Data.Interceptors;
using quiz_management_system.Infrastructure.Email;
using Resend;
using System.Reflection;
using System.Text;
namespace quiz_management_system.App;



public static class ServiceRegistration
{
    public static IServiceCollection AddPresentation(this IServiceCollection services, IConfiguration configuration)
    {



        services
            .AddAssemblyScanningConfiguration()
            .AddInfrastructure(configuration)
            .AddAssemblyScanningConfiguration()
            .AddIdentityConfiguration()
            .AddJwtConfiguration(configuration)
            .AddControllersWithVersioning()
            .AddSwaggerDocs()
            .AddMediatRAndPipeline()
            .AddFluentValidationPipeline()
            .AddCorsPolicy()
            .AddCache()
            .AddMessageSending(configuration)
            .ConfigureBackGroundJobs(configuration)
            .ConfigureForwardedHeaders()
            .ConfigureMappings()
            .ConfigureProblems()
            .AddUserContext();

        return services;
    }


    private static IServiceCollection AddAssemblyScanningConfiguration(this IServiceCollection services)
    {


        services.Scan(scan => scan
            .FromAssembliesOf(typeof(AppDbContext))
            .AddClasses(c => c.AssignableTo<IScopedService>()).AsImplementedInterfaces().WithScopedLifetime()
            .AddClasses(c => c.AssignableTo<ITransientService>()).AsImplementedInterfaces().WithTransientLifetime()
            .AddClasses(c => c.AssignableTo<ISingletonService>()).AsImplementedInterfaces().WithSingletonLifetime()
        );

        return services;
    }

    private static IServiceCollection AddIdentityConfiguration(this IServiceCollection services)
    {
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;

            options.User.RequireUniqueEmail = false;
            options.SignIn.RequireConfirmedAccount = true;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        return services;
    }


    private static IServiceCollection AddJwtConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<JwtSettings>()
            .BindConfiguration(JwtSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var jwtSettings = configuration
            .GetSection(JwtSettings.SectionName)
            .Get<JwtSettings>()
            ?? throw new InvalidOperationException(
                $"{JwtSettings.SectionName} section missing");
        services.AddSingleton(jwtSettings);

        services
            .AddAuthentication(options =>
            {

                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Cookies.TryGetValue("access_token", out var token))
                        {
                            context.Token = token;
                        }
                        return Task.CompletedTask;

                    }
                };

            })
        .AddGoogle(options =>
        {
            options.ClientId = configuration["Authentication:Google:ClientId"]
                ?? throw new InvalidOperationException("Google ClientId is missing");

            options.ClientSecret = configuration["Authentication:Google:ClientSecret"]
                ?? throw new InvalidOperationException("Google ClientSecret is missing");

            options.CallbackPath = "/api/identity/google/callback";

            options.SignInScheme = IdentityConstants.ExternalScheme;

            options.SaveTokens = true;

            options.Scope.Add("email");
            options.Scope.Add("profile");
        



        });

        return services;
    }

    private static IServiceCollection AddControllersWithVersioning(this IServiceCollection services)
    {
        services.AddControllers();

        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = new HeaderApiVersionReader("X-API-Version");
        })
        .AddMvc()
         .AddApiExplorer(options =>
         {
             options.GroupNameFormat = "'v'VVV";
             options.SubstituteApiVersionInUrl = true;
             options.DefaultApiVersion = new ApiVersion(1, 0);
             options.AssumeDefaultVersionWhenUnspecified = true;

         });

        return services;

    }

    private static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Quiz-Management-System API",
                Version = "v1",
                Description = "API documentation for the Quiz-Management-System API\".",
                Contact = new OpenApiContact
                {
                    Name = "Quiz-Management-System Dev Team",
                    Email = "support@Quiz.io"
                }
            });
        });

        return services;
    }


    private static IServiceCollection AddMediatRAndPipeline(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssemblyContaining<IAppDbContext>();


            Mediator.LicenseKey = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ikx1Y2t5UGVubnlTb2Z0d2FyZUxpY2Vuc2VLZXkvYmJiMTNhY2I1OTkwNGQ4OWI0Y2IxYzg1ZjA4OGNjZjkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2x1Y2t5cGVubnlzb2Z0d2FyZS5jb20iLCJhdWQiOiJMdWNreVBlbm55U29mdHdhcmUiLCJleHAiOiIxNzk0MjY4ODAwIiwiaWF0IjoiMTc2MjczMjg3OCIsImFjY291bnRfaWQiOiIwMTlhNmIxMGUyZTc3NDNhYmE1ZmIyNjI5MDQ2ZDJkOCIsImN1c3RvbWVyX2lkIjoiY3RtXzAxazluaDJhczk5MXp0cjIybTljY2I5YnI4Iiwic3ViX2lkIjoiLSIsImVkaXRpb24iOiIwIiwidHlwZSI6IjIifQ.EUJriLiiZ0vFJ0OTqGjUE2_FYtGiYvlOYIQCkwwGt8otj-n40PINMUxX1SHz2JxIDZcTkgtVSsNA2iLhzxvi1LzLCRSVXCLCxpOeWwv8EF3-sMkJoXLPlIhobVZV4iMKsGhRyMDYzjKJlSkdlx8OxRZQa23pX0a8IOouLgU1wwNSMyV10ASto3rd-8bK9zOGWJXA9QV5GO-GgykJSL_Qo9Q3cXprvdWQoxIC0DjrKHExfNCzgpEQ9qJWoo5gtahmwX7qsx0W1UPX0a5F5fyw6R5o4ANg5da9m-as0KacAw1wmM2_hIc1sfH4NcGmQ_dpoJ9qkqiBuaCFXxq_Szal3g";

        });

        return services;
    }

    private static IServiceCollection AddFluentValidationPipeline(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<IAppDbContext>();
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        // model binding validation
        // services.AddFluentValidationAutoValidation();

        return services;
    }


    private static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
                policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
        });

        return services;
    }


    public static IServiceCollection AddInfrastructure(
     this IServiceCollection services,
     IConfiguration configuration)
    {

        services.AddScoped<AuditableEntityInterceptor>();


        //var connectionString = configuration.GetConnectionString("DefaultConnection");

        //services.AddDbContext<AppDbContext>(options =>
        //    options.UseSqlServer(connectionString));

        var connectionString = configuration.GetConnectionString("PostgreSqlConnection");
        services.AddDbContext<AppDbContext>((sp, options) =>
    options
    .UseNpgsql(connectionString)

        .AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>()));





        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        return services;
    }

    public static IServiceCollection AddCache(
     this IServiceCollection services)
    {
        services.AddMemoryCache();


        return services;

    }


    public static IServiceCollection AddMessageSending(
         this IServiceCollection services,
         IConfiguration configuration)
    {
        services.Configure<ResendSettings>(configuration.GetSection("Resend"));

        services.AddOptions();
        services.AddHttpClient<ResendClient>();

        services.Configure<ResendClientOptions>(o =>
        {
            o.ApiToken = configuration["Resend:ApiKey"]!;
        });

        services.AddTransient<IResend, ResendClient>();

        services.AddScoped<IEmailSender, ResendEmailSender>();

        return services;
    }

    private static IServiceCollection ConfigureBackGroundJobs(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHangfire(Hangfireconfiguration => Hangfireconfiguration
         .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
         .UseSimpleAssemblyNameTypeSerializer()
         .UseRecommendedSerializerSettings()
         .UsePostgreSqlStorage(o => o.UseNpgsqlConnection(configuration.GetConnectionString("HangfirePostgreConnection"))));

        //  .UseSqlServerStorage(configuration.GetConnectionString("HangfireConnection")));

        // Add the processing server as IHostedService
        services.AddHangfireServer();
        return services;
    }



    private static IServiceCollection ConfigureForwardedHeaders(this IServiceCollection services)
    {

        _ = services.Configure<ForwardedHeadersOptions>(static options =>
        {
            options.ForwardedHeaders =
                ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

            // Remove default restrictions so IIS/ARR/Cloudflare/etc. are allowed
            options.KnownNetworks.Clear();
            options.KnownProxies.Clear();

            // Prevent spoofed X-Forwarded-For values
            options.ForwardLimit = 1; // only trust 1 proxy hop
        });
        return services;
    }
    private static IServiceCollection ConfigureMappings(this IServiceCollection services)
    {
        var config = TypeAdapterConfig.GlobalSettings;

        // Scan API and Application projects
        config.Scan(typeof(ServiceRegistration).Assembly);
        config.Scan(typeof(IAppDbContext).Assembly);

        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();

        return services;
    }

    private static IServiceCollection ConfigureProblems(this IServiceCollection services)
    {
        services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                context.ProblemDetails.Instance =
                    $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
            };
        }).AddProblemDetails();
        return services;
    }

    private static IServiceCollection AddUserContext(this IServiceCollection services)
    {
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddScoped<IUserContext, HttpUserContext>();


        return services;
    }

}
