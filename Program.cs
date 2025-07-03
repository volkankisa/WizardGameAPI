var builder = WebApplication.CreateBuilder(args);

// Services ekle
builder.Services.AddControllers();

// CORS policy ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("WizardGamePolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// CORS'u aktif et
app.UseCors("WizardGamePolicy");

app.UseAuthorization();
app.MapControllers();

// Console'da hangi URL'de çalıştığını göster
Console.WriteLine($"🎮 Wizard Game API çalışıyor: http://localhost:5117");
Console.WriteLine($"📚 Direct test: http://localhost:5117/api/wizardgame/status");

app.Run();