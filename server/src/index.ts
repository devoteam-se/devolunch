import express = require("express");
import path = require("path");

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_DIR = path.resolve(__dirname, "..", "..", "client")

const app = express();

// Serve static files
app.use(express.static(path.resolve(CLIENT_DIR, "build")));

app.get("/api", (req, res) => {
  res.send(mock);
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(CLIENT_DIR, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});


const mock = [
  {
    "title": "Spill",
    "description": "Gourmet sustainable food using recycled food",
    "imgUrl": "https://media-cdn.tripadvisor.com/media/photo-s/17/fa/8e/94/today-s-special.jpg",
    "dishes": [
      {
        "type": "meat",
        "description": "Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad"
      },
      {
        "type": "veg",
        "description": "Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad"
      }
    ]
  },
  {
    "title": "Aster",
    "description": "Local food made gourmet",
    "imgUrl": "https://media-cdn.tripadvisor.com/media/photo-s/0e/4d/68/73/aster-restaurant.jpg",
    "dishes": [
      {
        "type": "meat",
        "description": "Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad"
      },
      {
        "type": "veg",
        "description": "Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad"
      }
    ]
  },
  {
    "title": "Saltimporten",
    "description": "Food with low impact ",
    "imgUrl": "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
    "dishes": [
      {
        "type": "meat",
        "description": "Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad"
      },
      {
        "type": "veg",
        "description": "Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad"
      }
    ]
  },
  {
    "title": "Miamarias",
    "description": "Food made easy and local",
    "imgUrl": "https://i0.wp.com/www.takemetosweden.be/wp-content/uploads/2019/07/MiaMarias-Malm%C3%B6-1.png?resize=650%2C975&ssl=1",
    "dishes": [
      {
        "type": "meat",
        "description": "Roast beef with mashed potatoes, red wine sauce & tomato / broccoli salad"
      },
      {
        "type": "veg",
        "description": "Breaded grilled cheese with mashed potatoes, red wine sauce & tomato / broccoli salad"
      }
    ]
  }
]








