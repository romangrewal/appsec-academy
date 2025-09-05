using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace api.Controllers;

[ApiController]
[Route("[controller]")]
public class YouTubeVideosController : ControllerBase
{

    private readonly ILogger<YouTubeVideosController> _logger;
    private readonly HttpClient _httpClient;

    private const string CHANNEL_ID = "CHANNEL_ID";
    private const string API_KEY = "API_KEY";
    private const int MAX_RESULTS = 12;

    public async Task<string> GetResourceAsync(string endpoint)
    {
      HttpResponseMessage response = await _httpClient.GetAsync(endpoint);
      response.EnsureSuccessStatusCode(); // Throws an exception if the HTTP response status code is not 2xx.
      return await response.Content.ReadAsStringAsync();
    }


    public YouTubeVideosController(IHttpClientFactory httpClientFactory, ILogger<YouTubeVideosController> logger)
    {
         _httpClient = httpClientFactory.CreateClient("MyApiClient");
        _logger = logger;
    }

    [HttpGet(Name = "GetYouTubeVideos")]
    public string Get()
    {

      string URL = $"youtube/v3/search?" +
        $"part=snippet&channelId={CHANNEL_ID}&maxResults={MAX_RESULTS}" +
        $"&order=date&type=video&key={API_KEY}";
      string ytJsonString = GetResourceAsync(URL).Result;

      string profilePicURL = $"https://www.googleapis.com/youtube/v3/channels?" + 
        $"part=snippet&id={CHANNEL_ID}&key={API_KEY}";
      string profilePicJsonString = GetResourceAsync(profilePicURL).Result;


      JsonNode jsonNode1 = JsonNode.Parse(ytJsonString);
      JsonNode jsonNode2 = JsonNode.Parse(profilePicJsonString);

      JsonObject jsonObject1 = jsonNode1.AsObject();
      JsonObject jsonObject2 = jsonNode2.AsObject();

      JsonObject combinedJObject = new JsonObject();

      combinedJObject["YouTubeVideos"] = jsonObject1;
      combinedJObject["YouTubeProfile"] = jsonObject2;

      string combinedJsonString = System.Text.Json.JsonSerializer.Serialize(combinedJObject);

      return combinedJsonString;
    }
}
