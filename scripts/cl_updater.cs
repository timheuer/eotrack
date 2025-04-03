using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

public class Program
{
    private static readonly HttpClient client = new HttpClient();
    private const string DATA_FILE_PATH = "../src/data.json";
    private const string API_BASE_URL = "https://www.courtlistener.com/api/rest/v3/dockets/";

    public class Challenge
    {
        public string title { get; set; }
        public string url { get; set; }
        public string docketId { get; set; }
        public string lastUpdated { get; set; }
    }

    public class ExecutiveOrder
    {
        public string id { get; set; }
        public string title { get; set; }
        public string status { get; set; }
        public List<Challenge> challenges { get; set; }
    }

    static async Task Main()
    {
        // Get API key from environment
        string apiKey = Environment.GetEnvironmentVariable("CL_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("Error: CL_API_KEY environment variable not set");
            return;
        }

        // Set up HTTP client with authentication
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        try
        {
            // Read the data file and preserve its original line endings
            string jsonContent = await File.ReadAllTextAsync(DATA_FILE_PATH);
            var orders = JsonSerializer.Deserialize<List<ExecutiveOrder>>(jsonContent);

            bool hasUpdates = false;

            // Process each order with challenges
            foreach (var order in orders)
            {
                if (order.challenges == null || !order.challenges.Any()) continue;

                foreach (var challenge in order.challenges)
                {
                    if (string.IsNullOrEmpty(challenge.docketId)) continue;

                    try
                    {
                        Console.WriteLine($"Checking docket {challenge.docketId}...");

                        // Call Court Listener API
                        var response = await client.GetAsync($"{API_BASE_URL}{challenge.docketId}/");
                        if (response.IsSuccessStatusCode)
                        {
                            var content = await response.Content.ReadAsStringAsync();
                            var docketInfo = JsonDocument.Parse(content);

                            // Get the date_modified field
                            if (docketInfo.RootElement.TryGetProperty("date_modified", out JsonElement dateModified))
                            {
                                string newDate = dateModified.GetString();
                                if (newDate != challenge.lastUpdated)
                                {
                                    Console.WriteLine($"Updating lastUpdated for docket {challenge.docketId} from {challenge.lastUpdated} to {newDate}");
                                    challenge.lastUpdated = newDate;
                                    hasUpdates = true;
                                }
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Failed to get docket {challenge.docketId}: {response.StatusCode}");
                        }

                        // Be nice to the API
                        await Task.Delay(1000);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing docket {challenge.docketId}: {ex.Message}");
                    }
                }
            }

            // Save updates if any were made
            if (hasUpdates)
            {
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };
                string updatedJson = JsonSerializer.Serialize(orders, options);

                // Ensure Unix line endings (\n) and add newline at EOF if needed
                updatedJson = updatedJson.Replace("\r\n", "\n");
                if (!updatedJson.EndsWith("\n"))
                {
                    updatedJson += "\n";
                }

                // Use WriteAllBytes to avoid any line ending conversions
                await File.WriteAllBytesAsync(DATA_FILE_PATH, System.Text.Encoding.UTF8.GetBytes(updatedJson));
                Console.WriteLine("Updated data.json with new dates");
            }
            else
            {
                Console.WriteLine("No updates were needed");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}