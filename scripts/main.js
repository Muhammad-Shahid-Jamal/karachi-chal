import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';


// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = import.meta.env.VITE_GEMINI_KEY

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

// let flight_content = null;

let today = new Date();
// Extract year, month, and day
let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, '0'); 
let day = String(today.getDate()).padStart(2, '0');
// Format the date as "YYYY-MM-DD"
let formattedDate = `${year}-${month}-${day}`;

let flightUrl = `https://www.sastaticket.pk/air/search?cabinClass={%22code%22:%22Y%22,%22label%22:%22Economy%22}&legs[]={%22departureDate%22:%22${formattedDate}%22,%22origin%22:%22LHE%22,%22destination%22:%22KHI%22}&routeType=ONEWAY&travelerCount={%22numAdult%22:1,%22numChild%22:0,%22numInfant%22:0}`

form.onsubmit = async (ev) => {
  ev.preventDefault()

  try {
    const numberOfDays = document.querySelector('input[name="numberOfDays"]').value;
    const origin = document.querySelector('input[name="origin"]').value;
    const budget = document.querySelector('input[name="budget"]').value;
    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { text:  `I am coming from ${origin}. Give me a ${numberOfDays} days itinerary for Karachi, Pakistan, structured into an array of day-wise JSON objects. My budget is around ${budget}. Each day should include details like: Day number Title for the day's activities Description of the day's theme List of activities planned for the day Activity name Short description Estimated cost Distance from city center Operational hours (if applicable) Travel time from previous location (if applicable) Duration (if applicable) Suggestions for dinner options (if applicable). Please make sure each JSON object is fully populated and that only one list of all day wise JSON objects are returned. Please just return json object only no headings or anything.Please return all values with string inverted commas and the overall response should be a valid JSON object. Please ensure always an array of JSON objects must be returned`, },
        ]
      }
    ];

  


    // Call the gemini-pro model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",

      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

   


    // const flightsResult = await model.generateContentStream({ flight_content });
    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    // buffer.push(`{"flight_url":"${flightUrl}"}`)
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
 
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

