# Server

The server is a simple express app that serves the client, while also having the API to retrieve restaurants.

## Retrieve restaurants

URL : `/api/v1/restaurants`

Method : `GET`

### Success response

Code : `200 OK`

**Content example**

```json
{
  "date": "2023-05-19T15:39:18.558Z",
  "restaurants": [
    {
      "title": "BISe",
      "url": "https://bise.se/lunch",
      "imageUrl": "https://bise.se/_next/image?url=https%3A%2F%2Fcms.bise.se%2Fwp-content%2Fuploads%2F2022%2F10%2FLunch_Bise.jpeg&w=1080&q=75",
      "googleMapsUrl": "https://goo.gl/maps/9hmQUctdgeNvVSuF8",
      "latitude": 55.60675917303053,
      "longitude": 12.996173056055413,
      "dishCollection": [
        {
          "language": "sv",
          "dishes": [
            { "type": "veg", "description": "Kikärtor, pistage, tomat, rabarber" },
            { "type": "meat", "description": "Tartar, rabarber, selleri, rågbröd" }
          ]
        },
        {
          "language": "en",
          "dishes": [
            { "type": "veg", "description": "Chickpeas, pistachios, tomato, rhubarb" },
            { "type": "meat", "description": "Tartar, rhubarb, celery, rye bread" }
          ]
        }
      ]
    }
}
```
