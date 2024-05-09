import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import MarkdownIt from 'markdown-it';

// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = import.meta.env.VITE_GEMINI_KEY;

let form = document.getElementById('user-data-form');
const imagesTemp = [
  'https://fastly.picsum.photos/id/886/600/400.jpg?hmac=RmQ9CPTL_2PGDOqC-ZAZkHlfyUCcAg1w4oi5kZiCTvM',
  'https://fastly.picsum.photos/id/808/600/400.jpg?hmac=nqe437bEFcjgTgDDASyH_zyIFEcaSDdA5HdQ6ONF1X8',
  'https://fastly.picsum.photos/id/189/600/400.jpg?hmac=9vOKII0bn57_ozQrDVSj_FJ_UaTcVIefAUV4Y1CB9Nw',
  'https://fastly.picsum.photos/id/33/600/400.jpg?hmac=SO_Cyf3Lk-U7L1dVUEhSU1ZO_OsNzyB1GPz9_uEXx7g',
  'https://fastly.picsum.photos/id/691/600/400.jpg?hmac=bd2TObSOQIMrTV8iYIWASabUgURMOkpjhe2TtAYsjfk',
  'https://fastly.picsum.photos/id/520/600/400.jpg?hmac=07VunzHkqdtDVNDjzHnFXDa_GFwwyDAy4h2C1w7ZaNk',
  'https://fastly.picsum.photos/id/721/600/400.jpg?hmac=u1SWsr6VbXsDElG75HE-3JFoRY9e6AyQMCtVNqsEMZA',
  'https://fastly.picsum.photos/id/906/600/400.jpg?hmac=qR5PhaFuc6QQPOPynA5_612m4ebQjCHMFfbBYL8RrHE',
  'https://fastly.picsum.photos/id/610/600/400.jpg?hmac=-mBX0Y3eUcKvcdM5B9GeXVKbrm6pwn_64-b7tLcwT1k',
  'https://fastly.picsum.photos/id/788/600/400.jpg?hmac=0ZnFDVmR_XsmmQlq2L3vp1Kc9WEcXs8zNkMW0cO861M',
  'https://fastly.picsum.photos/id/554/600/400.jpg?hmac=ym0V0vQ_Oe4Jv28cp2H4hT4_nUI7t4guFm0ZUtCPZlc',
  'https://fastly.picsum.photos/id/727/600/400.jpg?hmac=yWYEPwQls8knn64yxV41MEojohyr8FAo5P3ncfMwUNU',
  'https://fastly.picsum.photos/id/775/600/400.jpg?hmac=UP0RIIW4wbnNRq9t1XEDj3SsKorrHFhbjuEEB3XyEzk',
  'https://fastly.picsum.photos/id/553/600/400.jpg?hmac=_hORVHdFVbrqIV3TtcZYlECU2JsPNavheQnHk3J35VM',
  'https://fastly.picsum.photos/id/391/600/400.jpg?hmac=9ACBmxEeEE8Xne9Vi2Ft6qgEb9atUpxQgHxdduohL4k',
  'https://fastly.picsum.photos/id/1048/600/400.jpg?hmac=BAR-B-NtEPJhWpqeuzc7mlW7fS9c-Ue0oGR7fmrkue8',
  'https://fastly.picsum.photos/id/376/600/400.jpg?hmac=GPnA8MlGgmv0s9ZOXE1G9D6VM9ejsLiGUWmnD-GdT-s',
  'https://fastly.picsum.photos/id/805/600/400.jpg?hmac=z2F7GIksIsmoNamiDlsr5tnvVd8OvAyWAc_l6oKYsKI',
  'https://fastly.picsum.photos/id/485/600/400.jpg?hmac=ASUUROyGnwBKv7j4HW6fueqaUdpC3PbB6dIlZZYxcMc',
  'https://fastly.picsum.photos/id/575/600/400.jpg?hmac=6AsAnS9-eZGiQrwueMtSAqVEUyl7VoeHYXF5UK8RLaE',
];

// let flight_content = null;

let today = new Date();
// Extract year, month, and day
let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, '0');
let day = String(today.getDate()).padStart(2, '0');
// Format the date as "YYYY-MM-DD"
let formattedDate = `${year}-${month}-${day}`;
const city = {
  Islamabad: 'ISB',
  Lahore: 'LHR',
  Peshawar: 'PEW',
};

form.onsubmit = async (ev) => {
  ev.preventDefault();
  const submitBtn = document.getElementById('submit-gemini');
  submitBtn.classList.add('loading');
  submitBtn.setAttribute('disabled', 'disabled');
  try {
    const numberOfDays = document.querySelector("input[name='days']").value;
    const origin = document.querySelector("select[name='origin']").value;
    const budget = document.querySelector("input[name='budget']").value;
    let flURL = `https://www.sastaticket.pk/air/search?cabinClass={"code":"Y","label":"Economy"}&legs[]={"departureDate":"${formattedDate}","origin":"${city[origin]}","destination":"KHI"}&routeType=ONEWAY&travelerCount={"numAdult":1,"numChild":0,"numInfant":0}`;
    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          {
            text: `
         I am coming from ${origin}. Give me a ${numberOfDays} days itinerary for Karachi, 
         Pakistan, structured into an array of day-wise JSON objects.
          My budget is around ${budget}, Each day should include details like: Day number Title for the day's activities Description of the day's theme List of activities planned for the day Activity name Short description Estimated
           cost Distance from city center Operational hours (if applicable) Travel time from previous location (if applicable) Duration (if applicable) Suggestions for dinner options (if applicable). Please make sure each JSON object is fully populated and that one array of day wise JSON objects are returned. The JSON response should be structured in the following way: - array at top level -objects of the day wise itinerary inside array -"day" key inside the object -"title" key inside the object -"description" key inside the object -"activities" which is an array of objects inside the day object -"activityName" key inside the object of "activities" array -"shortDescription" key inside the object of "activities" array -"estimatedCost" key inside the object of "activities" array -"distanceFromCityCenter" key inside object of "activities" array -"operationalHours" key inside object of "activities" array -"travelTimeFromPreviousLocation" key inside object of "activities" array -"duration" key inside object of "activities" array Please just return json object only no headings or anything.Please return all values with string inverted commas and the overall response should be a valid JSON object of the above verified structure. Please ensure always an array of JSON objects must be returned, I have also attached a populated sample object below as reference.          [{            "day": 1,            "title": "Arrival and Cultural Heritage Immersion",            "description": "Begin your exploration of Karachi by immersing yourself in its rich cultural heritage.",            "activities": [                {                    "activityName": "Visit Mohatta Palace Museum",                    "shortDescription": "Marvel at the stunning architecture and explore the history of Sindhi arts and crafts.",                    "estimatedCost": "1,000",                    "distanceFromCityCenter": "8 km",                    "operationalHours": "11:00 AM - 5:00 PM",                    "travelTimeFromPreviousLocation": "30 minutes",                    "duration": "2 hours"                },                {                    "activityName": "Attend a Sindhi Cultural Performance",                    "shortDescription": "Experience the vibrant traditional music, dance, and folklore of Sindh.",                    "estimatedCost": "1,500",           
           "distanceFromCityCenter": "5 km",                    "operationalHours": "7:00 PM - 9:00 PM",                    "travelTimeFromPreviousLocation": "20 minutes",                    "duration": "2 hours"                },                {                    "activityName": "Dinner at Koel Cafe",                    "shortDescription": "Indulge in authentic Sindhi cuisine amidst a charming ambiance.",                    "estimatedCost": "2,500"                }            ]        }]          ,          },        ],      },    ]
           `,
          },
        ],
      },
    ];

    // Call the gemini-pro model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',

      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // const flightsResult = await model.generateContentStream({ flight_content });
    const result = await model.generateContent({ contents });
    const JSONText = result.response.text();
    const parsedjson = JSON.parse(JSONText);
    console.log('HDHHERHHER', parsedjson);
    //   let promises= []
    //   itinerary.forEach(day => {
    //     console.log(Day ${day.day}:);
    //     day.activities.forEach(activity => {
    //         promises.push(https://api.unsplash.com/search/photos?per_page=3&client_id=UbFCOlLSd-wAU4eb8tC7-_ESmwydoIochiVFyvbXHo4&query=${activity.activityName})
    //     });
    //     console.log(); // Adding a newline for better readability
    // });

    const updatedItems = [];

    // Read from the stream and interpret the output as markdown
    const unsplashAccessKey = 'UbFCOlLSd-wAU4eb8tC7-_ESmwydoIochiVFyvbXHo4'; // Replace with your Unsplash access key

    // Function to fetch image for an item
    const fetchImageForItem = (item) => {
      return {
        ...item,
        image: imagesTemp[Math.round(Math.random() * imagesTemp.length - 1)],
      }; // Assuming you want to store the image URL
    };

    // Function to fetch images for all items in the array

    const fetchImagesForItems = async (activities) => {
      try {
        const itemsWithImages = [];
        for (let i = 0; i < activities.length; i++) {
          const itemWithImage = fetchImageForItem(activities[i]);
          itemsWithImages.push(itemWithImage);
        }
        console.log('Items with images:', itemsWithImages);
        return itemsWithImages;
      } catch (error) {
        console.error('Error fetching images for items:', error);
        throw error; // Rethrow the error to handle it outside
      }
    };

    const processItems = async () => {
      // debugger;
      for (const item of parsedjson) {
        try {
          const updatedActivities = await fetchImagesForItems(item.activities);
          updatedItems.push(updatedActivities);
        } catch (error) {
          // Handle individual item processing error here if needed
        }
      }
    };

    processItems()
      .then(() => {
        // console.log('UPdatedadfa', updatedItems);
        const mapedData = parsedjson.map((itinerary, index) => {
          return {
            ...itinerary,
            activities: updatedItems[index],
          };
        });
        console.log('final', mapedData);
        submitBtn.classList.remove('loading');
        submitBtn.removeAttribute('disabled');
        let mapD = mapDataToBody(mapedData);
        document.getElementById('contentContainer').innerHTML = mapD;
        document.getElementById('flight').style.display = 'flex';
        document.querySelector('#flight a').href = flURL;
        // Do something after all items are processed
      })
      .catch((error) => {
        console.error('Error processing items:', error);
      });
  } catch (e) {
    console.log(e);
  }
};

function mapDataToBody(data) {
  return data.reduce((prev, itineraryObj) => {
    const { day, description, title, activities } = itineraryObj;

    let allActivities = activities.reduce((prev, activ) => {
      let { activityName, duration, image, shortDescription, estimatedCost } =
        activ;
      if (duration === undefined) {
        duration = '2 hours';
      }
      let activity = `
        <div class="max-w-[250px]">
            <!-- images title and cost -->
            <div class="relative h-[300px]">
              <img src="${image}" alt="image" class="h-full w-full object-cover"/>
              <h3 class="absolute top-0 w-full flex justify-between p-2 bg-black bg-opacity-50 text-white"><span>${activityName}</span><span>${estimatedCost}/head</span></h3>
            </div>
            <p class="text-sm opacity-50 my-2"><img src="./assets/clock.svg" alt="clock" class="opacity-50 w-8 inline-block"/> ${duration}</p>
            <h4 class="font-bold text-theme">Description</h4>
            <p class="text-gray text-sm opacity-80">${shortDescription}</p>
          </div>
      `;
      return prev + activity;
    }, '');
    let itinerary = `
    <div class="relative shadow-md p-4 rounded-md mt-4 flex-1">
        <span class="absolute right-2 top-[-16px] italic text-gray-500 font-bold text-3xl drop-shadow opacity-50">Day ${day}</span>
        <h2 class="text-xl font-bold text-theme">${title}</h2>
        <p class="text-sm">${description}</p>
        <h2 class="mt-4 font-bold uppercase text-theme mb-2">Activities</h2>
        <div class="flex gap-4 flex-wrap">${allActivities}</div>
    </div>
  `;
    return prev + itinerary;
  }, '');
}
