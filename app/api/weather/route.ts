// A Route Handler: this file runs on the server, never in the browser.
// The page sends { latitude, longitude }, we ask Open-Meteo for the weather there right now,
// and send back four numbers. Open-Meteo needs no key; an API with a key works the same way,
// with the key read from .env.local.
const API = "https://api.open-meteo.com/v1/forecast";

export async function POST(request: Request) {
  const { latitude, longitude } = await request.json();
  const url = `${API}?latitude=${Number(latitude)}&longitude=${Number(longitude)}&current=temperature_2m,wind_speed_10m,precipitation,cloud_cover`;

  try {
    const response = await fetch(url);
    const { current } = await response.json();
    return Response.json({
      temperature: current.temperature_2m, // °C
      wind: current.wind_speed_10m, // km/h
      rain: current.precipitation, // mm in the last 15 minutes
      cloud: current.cloud_cover, // %
    });
  } catch {
    return Response.json({ error: "The weather request failed." }, { status: 500 });
  }
}
