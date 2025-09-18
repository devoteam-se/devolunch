import { RestaurantMetaProps } from '@devolunch/shared';

export const restaurantMetas: RestaurantMetaProps[] = [
  {
    title: 'Hyllie Bistro',
    url: 'https://www.hylliebryggeri.se/meny',
    imageUrl:
      'https://static.wixstatic.com/media/97d700_51961be0108c43cdb423ec5947b3096b~mv2.jpg/v1/crop/x_0,y_0,w_7165,h_4912/fill/w_882,h_604,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Bistro.jpg',
    googleMapsUrl: 'https://goo.gl/maps/dFEmStJASNgim5er5',
    coordinate: {
      lat: 55.6122995,
      lon: 12.9990657,
    },
    useContentCleaner: false,
  },
  {
    title: 'Benne Pastabar',
    url: 'https://bennepastabar.se/',
    imageUrl: 'https://bennepastabar.se/wp-content/themes/benne/images/benne-pastabar-order.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/CE6fKHpjB2wcEUcq7', // Using first location as default
    coordinate: { lat: 55.60313716015807, lon: 13.003559388316905 }, // Using first location as default
    multiLocation: {
      type: 'shared',
      locations: [
        {
          title: 'Hansa',
          googleMapsUrl: 'https://maps.app.goo.gl/CE6fKHpjB2wcEUcq7',
          coordinate: { lat: 55.6031381, lon: 13.0035595 },
        },
        {
          title: 'Västra hamnen',
          googleMapsUrl: 'https://maps.app.goo.gl/xPS7Y1yLKt3HGKH4A',
          coordinate: { lat: 55.6107112, lon: 12.9488093 },
        },
      ],
    },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Bistro Royal',
    url: 'https://bistroroyal.se/dagens-ratt/',
    imageUrl: 'https://cdn42.gastrogate.com/files/29072/bistroroyal-bistro-1-1.jpg',
    googleMapsUrl: 'https://goo.gl/maps/hSqYWPKgWVbSRj2s7',
    coordinate: { lat: 55.6088212, lon: 13.0009603 },
  },
  {
    title: 'Kontrast Västra Hamnen',
    url: 'https://www.kontrastrestaurang.se/menu/vastra-hamnen?tab=lunch',
    imageUrl:
      'https://usercontent.one/wp/www.kontrastrestaurang.se/wp-content/uploads/2022/08/Indian-food-hero.jpg?media=1666955164',
    googleMapsUrl: 'https://goo.gl/maps/sAfGLCky4RcSUZKw5',
    coordinate: { lat: 55.6100655, lon: 12.9737029 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Lokal 17',
    url: 'https://lokal17.se/',
    imageUrl: 'https://lokal17.se/app/uploads/sites/2/2018/01/bg-22.jpg',
    googleMapsUrl: 'https://goo.gl/maps/eMsNxGK743oQVj8D9',
    coordinate: { lat: 55.6121117, lon: 12.9953007 },
  },
  {
    title: 'MiaMarias',
    url: 'https://miamarias.nu/lunch/',
    imageUrl:
      'https://i0.wp.com/www.takemetosweden.be/wp-content/uploads/2019/07/MiaMarias-Malm%C3%B6-1.png?w=500&ssl=1',
    googleMapsUrl: 'https://goo.gl/maps/RrRffZzgebREQpwB7',
    coordinate: { lat: 55.6134471, lon: 12.9921145 },
  },
  {
    title: 'Namu',
    url: 'https://namu.nu/meny/',
    imageUrl: 'https://namu.nu/wp-content/uploads/2017/05/Namul-darker2-3k-min.jpg',
    googleMapsUrl: 'https://goo.gl/maps/XtFUKSvmDQTUpR146',
    coordinate: { lat: 55.6052051, lon: 12.9975172 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Niagara',
    url: 'https://restaurangniagara.se/lunch/',
    imageUrl: 'https://restaurangniagara.se/wp-content/uploads/sites/4/2015/08/Lunch-meny-Niagara1.jpg',
    googleMapsUrl: 'https://goo.gl/maps/5SAyzPUHhb2xrNXRA',
    coordinate: { lat: 55.6087223, lon: 12.9941398 },
  },
  {
    title: 'Quanbyquan',
    url: 'https://quanbyquan.se/',
    imageUrl: 'https://quanbyquan.se/wp-content/uploads/2019/09/Quan_Recept_08-1.jpg',
    googleMapsUrl: 'https://goo.gl/maps/5xyoBjWuU9vUcD6V8',
    coordinate: { lat: 55.605522, lon: 12.9980674 },
  },
  {
    title: 'Saltimporten',
    url: 'https://www.saltimporten.com/',
    imageUrl: 'https://www.saltimporten.com/media/IMG_6253-512x512.jpg',
    googleMapsUrl: 'https://goo.gl/maps/9rn3svDPeGUDaeXUA',
    coordinate: { lat: 55.616089, lon: 12.9971181 },
  },
  {
    title: 'Slagthuset',
    url: 'https://slagthuset.se/restaurangen/',
    imageUrl: 'https://slagthuset.se/static/d18f8e233d657ea77a2e7aeb3aa65eec/cc3b1/Sodra-Hallen01-1.jpg',
    googleMapsUrl: 'https://goo.gl/maps/ZMLMAHi8XhVss2At5',
    coordinate: { lat: 55.6110323, lon: 13.0033717 },
  },
  {
    title: 'Smak',
    url: 'https://gastrogate.com/lunch/print/6005',
    imageUrl: 'https://smak.info/wp-content/uploads/2022/05/IMG_2946-kall-1024x768.png',
    googleMapsUrl: 'https://goo.gl/maps/5NrVf9rA3gocZLvd7',
    coordinate: { lat: 55.5950556, lon: 12.9992295 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Spill',
    url: 'https://restaurangspill.se/',
    imageUrl: 'https://restaurangspill.se/static/0de07c5b4f98bc003befad5e872686b4/9bbaf/SPILL_09.jpg',
    googleMapsUrl: 'https://goo.gl/maps/bZ8yDN3PD3fjvNGw5', // Using first location as default
    coordinate: { lat: 55.6127354, lon: 12.9884119 }, // Using first location as default
    multiLocation: {
      type: 'filtered',
      locations: [
        {
          title: 'Gängtappen',
          locationFilter: 'Gängtappen|Dockan',
          googleMapsUrl: 'https://goo.gl/maps/bZ8yDN3PD3fjvNGw5',
          coordinate: { lat: 55.6127354, lon: 12.9884119 },
        },
        {
          title: 'Kvartetten',
          locationFilter: 'Kvartetten|Hyllie',
          googleMapsUrl: 'https://maps.app.goo.gl/TNctkWiKh6FpzHAP7',
          coordinate: { lat: 55.6117385, lon: 12.9301944 },
        },
      ],
    },
  },
  {
    title: 'Köket lu',
    url: 'https://www.koket.lu/malmo/lunch',
    imageUrl: 'https://www.koket.lu/img/lu_logo.5ba196ad.png',
    googleMapsUrl: 'https://maps.app.goo.gl/r89Vog772eqdu3mt7',
    coordinate: { lat: 55.5993441, lon: 12.9977983 },
  },
  {
    title: 'Marvin',
    url: 'https://www.marvinofmalmo.com/',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/63751d9e0fcf4f66c079a897/1e65f5d1-1dc4-46c2-bc5d-9f9f8254a362/favicon.ico?format=100w',
    googleMapsUrl: 'https://maps.app.goo.gl/rjKhvkHbwfdoC62g9',
    coordinate: { lat: 55.5998692, lon: 12.9991679 },
  },
  {
    title: 'Two Forks',
    url: 'https://www.twoforks.se/lunch',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/5c6fc5858155121249a4c49f/d9867018-aaa7-4d7c-8a5b-b5f666277406/%C2%A9jensnordstromtwoforks0027.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/GKATv8jSGjbAKfYt5',
    coordinate: { lat: 55.6073278, lon: 12.9920499 },
  },
  {
    title: 'Välfärden',
    url: 'https://valfarden.nu/dagens-lunch/',
    imageUrl: 'https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg',
    googleMapsUrl: 'https://goo.gl/maps/cLAKuD2B95N8bqr19',
    coordinate: { lat: 55.6112257, lon: 12.9943631 },
  },
  {
    title: 'Restaurang Bullen',
    url: 'https://www.bullen.nu/sv/lunch/',
    imageUrl: 'https://www.bullen.nu/media/k3sl1vyj/bullen_logo_web.png',
    googleMapsUrl: 'https://maps.app.goo.gl/3VCjtsGxBm9VHDc97',
    coordinate: { lat: 55.5999602, lon: 12.9988244 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Spoonery',
    url: 'https://www.spoonery.se/restaurang/slottstaden/', // Using first location as default
    imageUrl: 'https://www.spoonery.se/wp-content/uploads/2024/11/cropped-favicon-32x32.png',
    googleMapsUrl: 'https://maps.app.goo.gl/1dxLU2ZUpH3ggFQg8', // Using first location as default
    coordinate: { lat: 55.59717, lon: 12.97902 }, // Using first location as default
    unknownMealDefault: 'veg',
    multiLocation: {
      type: 'separate',
      locations: [
        {
          title: 'Slottstaden',
          url: 'https://www.spoonery.se/restaurang/slottstaden/',
          locationFilter: 'Slottstaden',
          googleMapsUrl: 'https://maps.app.goo.gl/Tkufn1rFU4qzCokQ8',
          coordinate: { lat: 55.5972562, lon: 12.976425 },
        },
        {
          title: 'Sankt Knut',
          url: 'https://www.spoonery.se/restaurang/st-knut/',
          locationFilter: 'Sankt Knut|ST: Knut',
          googleMapsUrl: 'https://maps.app.goo.gl/2z6FT53UdTHH8A4J7',
          coordinate: { lat: 55.5968355, lon: 13.011534 },
        },
        {
          title: 'Gamla Väster',
          url: 'https://www.spoonery.se/restaurang/gamla-vaster/',
          locationFilter: 'Gamla Väster',
          googleMapsUrl: 'https://maps.app.goo.gl/1dxLU2ZUpH3ggFQg8',
          coordinate: { lat: 55.605601, lon: 12.9832051 },
        },
        {
          title: 'Hyllie',
          url: 'https://www.spoonery.se/restaurang/hyllie',
          locationFilter: 'Hyllie',
          googleMapsUrl: 'https://maps.app.goo.gl/7XZkE58A1PPujvrr7',
          coordinate: { lat: 55.5613039, lon: 12.9737268 },
        },
      ],
    },
  },
  {
    title: 'La Fonderie',
    url: 'https://www.lafonderie.se/lelunch',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/67c60654ba161009af4d26d3/2a7cddf3-30ed-409a-827d-aeaa8ef71a63/baguette.png',
    googleMapsUrl: 'https://maps.app.goo.gl/8PYHkDJe8bv2NafBA',
    coordinate: { lat: 55.6110563, lon: 12.9889958 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Varv Malmö',
    url: 'https://www.varvmalmo.com/menu',
    imageUrl: 'https://www.varvmalmo.com/favicon.ico',
    googleMapsUrl: 'https://maps.app.goo.gl/UyPUzaFyW6cX8bwC9',
    coordinate: { lat: 55.6121049, lon: 12.9255438 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Sauvage Malmö',
    url: 'https://restaurangsauvage.se/lunchmeny',
    imageUrl: 'https://restaurangsauvage.se/favicon.ico',
    googleMapsUrl: 'https://maps.app.goo.gl/BgoSgesjSSxsen7s5',
    coordinate: { lat: 55.5961469, lon: 12.9913278 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Restaurang Nils',
    url: 'https://restaurangnils.se/lunch-restaurang-malmo/',
    imageUrl: 'https://restaurangnils.se/favicon.ico',
    googleMapsUrl: 'https://maps.app.goo.gl/fAxMDQardQqSSmtU8',
    coordinate: { lat: 55.5985416, lon: 12.979711 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Folk mat och möten',
    url: 'https://folkmatmoten.se/restaurang/',
    imageUrl: 'https://folkmatmoten.se/wp-content/uploads/2023/11/Mat4.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/FWwJJQrKjeEmFdtXA',
    coordinate: {
      lat: 55.5918325,
      lon: 13.0194972,
    },
    unknownMealDefault: 'veg',
  },
  {
    title: 'La Bonne Vie',
    url: 'https://labonnevie.se/',
    imageUrl: 'https://labonnevie.se/img/labonnevie_logo.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/eGorxVpGBAobFSKC9',
    coordinate: {
      lat: 55.5991391,
      lon: 12.9979327,
    },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Osteria di la',
    url: 'https://osteriadila.se/',
    imageUrl: 'https://media.osteriadila.se/2023/03/DILA-TEXT-300PX.png',
    googleMapsUrl: 'https://maps.app.goo.gl/eGorxVpGBAobFSKC9',
    coordinate: {
      lat: 55.5991391,
      lon: 12.9979327,
    },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Osteria Qui',
    url: 'https://osteriaqui.se/meny/',
    imageUrl: 'https://osteriaqui.se/wp-content/uploads/2022/04/osteria_logo-2.png',
    googleMapsUrl: 'https://maps.app.goo.gl/Z88vt4no56UZXS9f9',
    coordinate: {
      lat: 55.5966996,
      lon: 12.969856,
    },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Enoclub Osteria',
    url: 'https://www.enoclub.se/meny',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/65e04f8287d2472b18e24357/0a2c9837-4287-4a3d-91c0-4fcaa128a059/Enoclub+logo+black.png?format=1500w',
    googleMapsUrl: 'https://maps.app.goo.gl/WCvg7uwahvkpF6yK8',
    coordinate: {
      lat: 55.604698,
      lon: 12.9972076,
    },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Thap Thim',
    url: 'https://thapthim.se/lunch',
    imageUrl: 'https://thapthim.se/img/logo/vg.png',
    googleMapsUrl: 'https://maps.app.goo.gl/GLgqwTmwaqhCMWMdA', // Using first location as default
    coordinate: { lat: 55.6066801, lon: 12.9928927 }, // Using first location as default
    unknownMealDefault: 'veg',
    multiLocation: {
      type: 'shared',
      locations: [
        {
          title: 'Västergatan',
          googleMapsUrl: 'https://maps.app.goo.gl/GLgqwTmwaqhCMWMdA',
          coordinate: { lat: 55.6066801, lon: 12.9928927 },
        },
        {
          title: 'Västra hamnen',
          googleMapsUrl: 'https://maps.app.goo.gl/dmiqDGpPaywiDW5V9',
          coordinate: { lat: 55.6119766, lon: 12.9763255 },
        },
      ],
    },
  },
  {
    title: 'The Torso',
    url: 'https://thetorso.se/#page-4',
    imageUrl: 'https://thetorso.se/_assets/media/9035c7b5a7eaf4387b74a0652230937e.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/8vh13whnFucSrML26',
    coordinate: { lat: 55.6135861, lon: 12.975145 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Babusia',
    url: 'https://babusia.se/menus/',
    imageUrl: 'https://babusia.se/wp-content/uploads/2024/09/menus_babusia_se.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/znba1zVV3qMvC4UG6',
    coordinate: { lat: 55.6075804, lon: 12.9865752 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Elsa',
    url: 'https://www.elsamalmo.com/menu',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/61139b36ec63322fbda6d6a1/ba60c2ed-b673-4042-9f82-48255de03ba9/ABC2B5B7-B9A2-4F08-9C26-BDD99A4E83C3.png?format=1500w',
    googleMapsUrl: 'https://maps.app.goo.gl/LnKL7KkKfmMML4y76',
    coordinate: { lat: 55.6068487, lon: 12.9876917 },
    unknownMealDefault: 'veg',
    useContentCleaner: false,
  },
  {
    title: 'Ruths',
    url: 'https://ruthsmalmo.se/en/#menu',
    imageUrl: 'https://ruthsmalmo.se/wp-content/themes/ruths-malmo-theme/dist/images/logo_57deb727.svg',
    googleMapsUrl: 'https://maps.app.goo.gl/FhKo1ctUa9Aa67h49',
    coordinate: { lat: 55.606242, lon: 12.9966079 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Brasserie Sture',
    url: 'https://sture1912.com/sv/',
    imageUrl: 'https://sture1912.com/wp-content/uploads/2023/08/STURE_COLOR.png',
    googleMapsUrl: 'https://maps.app.goo.gl/UtAQQ3sGfCyCSF5S7',
    coordinate: { lat: 55.606242, lon: 12.9966079 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Årstiderna',
    url: 'https://arstiderna.pieplowsrestauranger.se/lunch/',
    imageUrl: 'https://mediabeta.pieplowsrestauranger.se/2018/05/cropped-logo2-1.png',
    googleMapsUrl: 'https://maps.app.goo.gl/x2Bi7kxVJa4huAud6',
    coordinate: { lat: 55.6067435, lon: 12.9940981 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Nam do',
    url: 'https://namdo.se/meny/#lunchmeny',
    imageUrl: 'https://namdo.se/wp-content/uploads/2018/06/180615-namdo-prev-156.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/ph1WMXqsnXuzA8Kb6',
    coordinate: { lat: 55.6044133, lon: 12.9978916 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Marie Antoinette',
    url: 'https://marieantoinette.se/lunch/',
    imageUrl: 'https://marieantoinette.se/wp-content/uploads/2025/08/image00002.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/1jK3QEwkvH1VSC5G7',
    coordinate: { lat: 55.6080352, lon: 13.0082392 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'KOL & Cocktails',
    url: 'https://kolmalmo.se/#bokabord',
    imageUrl: 'https://kolmalmo.se/wp-content/uploads/2017/09/Kvallen.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/dBT4SqrxpWkWEfm1A',
    coordinate: { lat: 55.6049907, lon: 13.000674 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Mrs Saigon',
    url: 'https://www.mrs-saigon.se/meny/',
    imageUrl: 'https://www.mrs-saigon.se/wp-content/uploads/2021/08/DSC05357.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/tbr8W9zgifFNMF1R6',
    coordinate: { lat: 55.6033363, lon: 12.9957584 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Epicuré',
    url: 'https://epicure.nu/lunch/',
    imageUrl: 'https://epicure.nu/wp-content/uploads/2021/06/epicure-restaurang.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/V8JZiGPaZXwAg4w57',
    coordinate: { lat: 55.6032725, lon: 12.9973569 },
    unknownMealDefault: 'veg',
  },
  {
    title: 'Green Mango',
    url: 'https://www.greenmango.se/',
    imageUrl:
      'https://static.wixstatic.com/media/4ef303_bf12a28909dc4040b74d79fb22ebef0a~mv2.jpg/v1/fit/w_513,h_685,q_90,enc_avif,quality_auto/4ef303_bf12a28909dc4040b74d79fb22ebef0a~mv2.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/kZ4DrgTLP9Rpk3iG8',
    coordinate: { lat: 55.5984894, lon: 12.9932109 },
    unknownMealDefault: 'veg',
  },
];
