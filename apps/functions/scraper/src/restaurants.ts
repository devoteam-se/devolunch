import { RestaurantMetaProps } from '@devolunch/shared';

export const restaurants: RestaurantMetaProps[] = [
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
    useContentCleaner: false,
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
    imageUrl: 'https://cdn.kontrast.swindila.com/kontrastimages/vastrahamnenmenu.jpg',
    googleMapsUrl: 'https://goo.gl/maps/sAfGLCky4RcSUZKw5',
    coordinate: { lat: 55.6100655, lon: 12.9737029 },
    useContentCleaner: false,
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
  // // {
  // //   title: 'Namu',
  // //   url: 'https://namu.nu/meny/',
  // //   imageUrl: 'https://namu.nu/wp-content/uploads/2017/05/Namul-darker2-3k-min.jpg',
  // //   googleMapsUrl: 'https://goo.gl/maps/XtFUKSvmDQTUpR146',
  // //   coordinate: { lat: 55.6052051, lon: 12.9975172 },
  // // },
  {
    title: 'Niagara',
    url: 'https://restaurangniagara.se/lunch/',
    imageUrl: 'https://restaurangniagara.se/wp-content/uploads/2024/10/NIAGARA-27.webp',
    googleMapsUrl: 'https://goo.gl/maps/5SAyzPUHhb2xrNXRA',
    coordinate: { lat: 55.6087223, lon: 12.9941398 },
    useContentCleaner: false,
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
    useContentCleaner: false,
  },
  {
    title: 'Slagthuset',
    url: 'https://slagthuset.se/restaurangen/',
    imageUrl:
      'https://www.slagthuset.se/_next/image?url=https%3A%2F%2Fwp.slagthuset.se%2Fwp-content%2Fuploads%2F2023%2F02%2FSodra-Hallen01-1-1500x1000.jpg&w=3840&q=80',
    googleMapsUrl: 'https://goo.gl/maps/ZMLMAHi8XhVss2At5',
    coordinate: { lat: 55.6110323, lon: 13.0033717 },
  },
  {
    title: 'Smak',
    url: 'https://gastrogate.com/lunch/print/6005',
    imageUrl: 'https://smak.info/wp-content/uploads/2022/05/IMG_2946-kall-1024x768.png',
    googleMapsUrl: 'https://goo.gl/maps/5NrVf9rA3gocZLvd7',
    coordinate: { lat: 55.5950556, lon: 12.9992295 },
  },
  {
    title: 'Spill',
    url: 'https://restaurangspill.se/',
    imageUrl: 'https://www.restaurangspill.se/_next/image?url=%2Fimages%2Fv2%2FSPILL_14.jpg&w=1920&q=75',
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
    imageUrl:
      'https://static.thatsup.co/content/img/place/malmo/ko/3946013a-f19b-11e9-814c-f23c919fea3e/user-photo/7c8aa451.jpg?1706718174',
    googleMapsUrl: 'https://maps.app.goo.gl/r89Vog772eqdu3mt7',
    coordinate: { lat: 55.5993441, lon: 12.9977983 },
  },
  {
    title: 'Marvin',
    url: 'https://www.marvinofmalmo.com/',
    imageUrl: 'https://highfiveskane.se/wp-content/uploads/2022/05/marvin-4-scaled.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/rjKhvkHbwfdoC62g9',
    coordinate: { lat: 55.5998692, lon: 12.9991679 },
    useContentCleaner: false,
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
    imageUrl: 'https://www.bullen.nu/media/mz1djpbh/lunch_mag_3379.jpg?height=810px',
    googleMapsUrl: 'https://maps.app.goo.gl/3VCjtsGxBm9VHDc97',
    coordinate: { lat: 55.5999602, lon: 12.9988244 },
  },
  {
    title: 'Spoonery',
    url: 'https://www.spoonery.se/restaurang/gamla-vaster', // Using working location URL
    imageUrl: 'https://www.spoonery.se/wp-content/uploads/2024/11/241015_Spoonery__Slotts_01_NY.webp',
    googleMapsUrl: 'https://maps.app.goo.gl/1dxLU2ZUpH3ggFQg8', // Using first location as default
    coordinate: { lat: 55.59717, lon: 12.97902 }, // Using first location as default
    useContentCleaner: true, // Enable content cleaner for all locations
    multiLocation: {
      type: 'separate',
      locations: [
        {
          title: 'Sankt Knut',
          url: 'https://www.spoonery.se/restaurang/st-knut/',
          googleMapsUrl: 'https://maps.app.goo.gl/2z6FT53UdTHH8A4J7',
          coordinate: { lat: 55.5968355, lon: 13.011534 },
        },
        {
          title: 'Hyllie',
          url: 'https://www.spoonery.se/restaurang/hyllie',
          googleMapsUrl: 'https://maps.app.goo.gl/7XZkE58A1PPujvrr7',
          coordinate: { lat: 55.5613039, lon: 12.9737268 },
        },
      ],
    },
  },
  {
    title: 'La Fonderie',
    url: 'https://www.lafonderie.se/lelunch',
    imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.5Df6Sz7sxETn462Iq1yXiAHaEy?pid=Api',
    googleMapsUrl: 'https://maps.app.goo.gl/8PYHkDJe8bv2NafBA',
    coordinate: { lat: 55.6110563, lon: 12.9889958 },
    useContentCleaner: false,
  },
  {
    title: 'Varv Malmö',
    url: 'https://www.varvmalmo.com/menu',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/67a758574768d80eed1d0b9f/072c583d-3cfd-4756-a07d-2e506957a2ec/DSC08171-Enhanced-NR.png?format=750w',
    googleMapsUrl: 'https://maps.app.goo.gl/UyPUzaFyW6cX8bwC9',
    coordinate: { lat: 55.6122023, lon: 12.9908859 },
  },
  {
    title: 'Sauvage',
    url: 'https://restaurangsauvage.se/lunchmeny',
    imageUrl: 'https://highfiveskane.se/wp-content/uploads/2024/04/sauvage-18-scaled.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/BgoSgesjSSxsen7s5',
    coordinate: { lat: 55.5961483, lon: 13.0097815 },
  },
  {
    title: 'Restaurang Nils',
    url: 'https://restaurangnils.se/lunch-restaurang-malmo/',
    imageUrl: 'https://restaurangnils.se/wp-content/uploads/sites/21/2022/10/Nils-13.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/fAxMDQardQqSSmtU8',
    coordinate: { lat: 55.5985416, lon: 12.979711 },
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
  },
  {
    title: 'La Bonne Vie',
    url: 'https://labonnevie.se/',
    imageUrl: 'https://highfiveskane.se/wp-content/uploads/2023/02/la-bonne-vie-18-1024x640.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/eGorxVpGBAobFSKC9',
    coordinate: {
      lat: 55.5991391,
      lon: 12.9979327,
    },
  },
  {
    title: 'Osteria di la',
    url: 'https://osteriadila.se/',
    imageUrl: 'https://media.osteriadila.se/2023/03/dila1.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/eGorxVpGBAobFSKC9',
    coordinate: {
      lat: 55.5991391,
      lon: 12.9979327,
    },
  },
  {
    title: 'Osteria Qui',
    url: 'https://osteriaqui.se/meny/',
    imageUrl: 'https://osteriaqui.se/wp-content/uploads/2022/11/osteria-mat.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/Z88vt4no56UZXS9f9',
    coordinate: {
      lat: 55.5966996,
      lon: 12.969856,
    },
  },
  {
    title: 'Enoclub Osteria',
    url: 'https://www.enoclub.se/meny',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/65e04f8287d2472b18e24357/9c0e45ea-5ca4-4e78-a7a5-ef5a84d600e8/iStock-1136638905.jpg?format=2500w',
    googleMapsUrl: 'https://maps.app.goo.gl/WCvg7uwahvkpF6yK8',
    coordinate: {
      lat: 55.604698,
      lon: 12.9972076,
    },
  },
  {
    title: 'Thap Thim',
    url: 'https://thapthim.se/lunch',
    imageUrl: 'https://api.thapthim.se/?imgtype=slider&store=vg&imgid=20230105163927437216001672933167.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/GLgqwTmwaqhCMWMdA', // Using first location as default
    coordinate: { lat: 55.6066801, lon: 12.9928927 }, // Using first location as default
    useContentCleaner: false,
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
  },
  {
    title: 'Babusia',
    url: 'https://babusia.se/menus/',
    imageUrl: 'https://babusia.se/wp-content/uploads/2024/09/menus_babusia_se.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/znba1zVV3qMvC4UG6',
    coordinate: { lat: 55.6075804, lon: 12.9865752 },
  },
  {
    title: 'Elsa',
    url: 'https://www.elsamalmo.com/menu',
    imageUrl:
      'https://ftstorageprod.blob.core.windows.net/images/restaurant/ad719f49/images/7aa434b7-48bc-45f0-87a3-f0640d2f127d_m.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/LnKL7KkKfmMML4y76',
    coordinate: { lat: 55.6068487, lon: 12.9876917 },
    useContentCleaner: false,
  },
  {
    title: 'Ruths',
    url: 'https://ruthsmalmo.se/en/#menu',
    imageUrl: 'https://highfiveskane.se/wp-content/uploads/2024/01/ruths-31-scaled.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/FhKo1ctUa9Aa67h49',
    coordinate: { lat: 55.606242, lon: 12.9966079 },
    useContentCleaner: false,
  },
  {
    title: 'Brasserie Sture',
    url: 'https://sture1912.com/sv/',
    imageUrl: 'https://interni.se/wp-content/uploads/2023/09/L8A5740-1.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/UtAQQ3sGfCyCSF5S7',
    coordinate: { lat: 55.606242, lon: 12.9966079 },
    useContentCleaner: false,
  },
  {
    title: 'Årstiderna',
    url: 'https://arstiderna.pieplowsrestauranger.se/lunch/',
    imageUrl:
      'https://mediabeta.pieplowsrestauranger.se/2024/07/WhatsApp-Bild-2024-05-17-kl.-21.50.45_da5e237c-1000x1000.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/x2Bi7kxVJa4huAud6',
    coordinate: { lat: 55.6067435, lon: 12.9940981 },
  },
  {
    title: 'Nam do',
    url: 'https://namdo.se/meny/#lunchmeny',
    imageUrl: 'https://namdo.se/wp-content/uploads/2018/06/180615-namdo-prev-156.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/ph1WMXqsnXuzA8Kb6',
    coordinate: { lat: 55.6044133, lon: 12.9978916 },
  },
  {
    title: 'Marie Antoinette',
    url: 'https://marieantoinette.se/lunch/',
    imageUrl: 'https://marieantoinette.se/wp-content/uploads/2025/08/image00002.jpeg',
    googleMapsUrl: 'https://maps.app.goo.gl/1jK3QEwkvH1VSC5G7',
    coordinate: { lat: 55.6080352, lon: 13.0082392 },
  },
  // {
  //   title: 'KOL & Cocktails',
  //   url: 'https://kolmalmo.se/#bokabord',
  //   imageUrl: 'https://kolmalmo.se/wp-content/uploads/2017/09/Kvallen.jpg',
  //   googleMapsUrl: 'https://maps.app.goo.gl/dBT4SqrxpWkWEfm1A',
  //   coordinate: { lat: 55.6049907, lon: 13.000674 },
  // },
  {
    title: 'Mrs Saigon',
    url: 'https://www.mrs-saigon.se/meny/',
    imageUrl: 'https://www.mrs-saigon.se/wp-content/uploads/2021/08/DSC05357.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/tbr8W9zgifFNMF1R6',
    coordinate: { lat: 55.6033363, lon: 12.9957584 },
  },
  {
    title: 'Epicuré',
    url: 'https://epicure.nu/lunch/',
    imageUrl: 'https://epicure.nu/wp-content/uploads/2021/06/epicure-restaurang.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/V8JZiGPaZXwAg4w57',
    coordinate: { lat: 55.6032725, lon: 12.9973569 },
  },
  {
    title: 'Green Mango',
    url: 'https://www.greenmango.se/lunch',
    imageUrl:
      'https://static.wixstatic.com/media/4ef303_bf12a28909dc4040b74d79fb22ebef0a~mv2.jpg/v1/fit/w_513,h_685,q_90,enc_avif,quality_auto/4ef303_bf12a28909dc4040b74d79fb22ebef0a~mv2.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/kZ4DrgTLP9Rpk3iG8',
    coordinate: { lat: 55.5984894, lon: 12.9932109 },
  },
  {
    title: 'Art of Spices',
    url: 'https://www.artofspices.se/lunch/',
    imageUrl: 'https://www.artofspices.se/wp-content/uploads/2023/06/Art-of-Spices-2.png',
    googleMapsUrl: 'https://maps.app.goo.gl/5nYkfBojuaofG9TL9',
    coordinate: { lat: 55.5960318, lon: 13.006827 },
  },
  {
    title: 'Green Chili',
    url: 'https://greenchili.gastrogate.com/lunch/',
    imageUrl: 'https://gastrogate.com/thumbs/1870/files/29598/18-chicken-tikka-sizlar-richard-jonsson.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/u6P3kCf4K5cC1mC29',
    coordinate: { lat: 55.6050553, lon: 12.9958384 },
  },
  {
    title: 'Hamn och Peppar',
    url: 'https://www.restauranghamnpeppar.se/veckans-meny.html',
    imageUrl: 'https://www.restauranghamnpeppar.se/uploads/5/2/9/6/5296471/istockphoto-104704117-612x612_orig.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/jwwDrdAwVPBXAvVE9',
    coordinate: { lat: 55.6137105, lon: 13.012575 },
  },
  {
    title: 'Kolga',
    url: 'https://www.restaurangkolga.se/lunch/',
    imageUrl: 'https://gastrogate.com/thumbs/825x330/files/2716/kolgapic2.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/9RUmmTDbAmS2aNjS8',
    coordinate: { lat: 55.6122883, lon: 12.9959043 },
  },
  {
    title: 'Vibliotek',
    url: 'https://mandarin-pelican-ymx5.squarespace.com/lunch-menu',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/6645cfd836b7d276a870d2cf/360f2f6c-f76b-4b1e-b23d-329b0a66b133/Tapas.jpg?format=1500w',
    googleMapsUrl: 'https://maps.app.goo.gl/MnLGGZwi9SNkPoqr8',
    coordinate: { lat: 55.6014483, lon: 13.0012605 },
  },
  {
    title: 'MJs',
    url: 'https://mjs.life/lunch/',
    imageUrl: 'https://highfiveskane.se/wp-content/uploads/2021/08/mjs-6-scaled.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/38VrxH2hWtyCBbNq8',
    coordinate: { lat: 55.6058052, lon: 12.9954576 },
    useContentCleaner: false,
  },
  {
    title: 'Operagrillen',
    url: 'https://www.malmoopera.se/mat-och-dryck/lunch-i-operagrillen',
    imageUrl:
      'https://www.malmoopera.se/sites/default/files/styles/hero_performance_sm_2x/public/2025-05/Lunch_1920x1080.jpg.webp?itok=HXawlwZi',
    googleMapsUrl: 'https://maps.app.goo.gl/s1inU9BDZbz9SSMW9',
    coordinate: { lat: 55.5966206, lon: 12.9959032 },
  },
  {
    title: 'Atmosfär',
    url: 'https://www.atmosfar.com/meny',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/5dea6af0942ce02c9fb094ba/1696237224654-59OR1E4WSBBZ3287X49N/Atmo_Uteservering_2023.jpg?format=1500w',
    googleMapsUrl: 'https://maps.app.goo.gl/e87Gi8vowFuaeimq5',
    coordinate: { lat: 55.5998057, lon: 12.9936969 },
  },
  {
    title: 'Chef mama',
    url: 'https://chefmama.se/cafe-menu/',
    imageUrl:
      'https://chefmama.se/wp-content/uploads/2024/05/chef-mama-x-blique-by-nobis-stockholm-2024-1600w-min-2-uai-914x914.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/3eoBTKRv4tdsyaYm6',
    coordinate: { lat: 55.6049421, lon: 13.0193656 },
  },
  {
    title: 'Ngon',
    url: 'https://ngonrestaurang.se/dagen-lunch/',
    imageUrl: 'https://ngonrestaurang.se/wp-content/uploads/2024/04/3-psvabahmoldyzibzpzaqrd9skivj1c7wjgqjej387g-1.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/qLCt6TzfeP4qNztx7',
    coordinate: { lat: 55.5988425, lon: 12.9971835 },
  },
  {
    title: 'Hörnet',
    url: 'https://www.xn--hr-fka.net/',
    imageUrl: 'https://www.xn--hr-fka.net/wp-content/uploads/2024/11/hornetbild2.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/7RKde9ADSLQC1yUW7',
    coordinate: { lat: 55.5981987, lon: 12.9790761 },
  },
  {
    title: 'Sushibaren',
    url: 'https://sushi-baren.se/menu-1',
    imageUrl:
      'https://impro.usercontent.one/appid/oneComWsb/domain/sushi-baren.se/media/sushi-baren.se/onewebmedia/PXL_20240617_140825996~2(1).jpg?etag=%2227a308-679ff19b%22&sourceContentType=image%2Fjpeg&ignoreAspectRatio&resize=486%2B524&extract=40%2B0%2B436%2B524&quality=85',
    googleMapsUrl: 'https://maps.app.goo.gl/6hVvqpGJrBYccAr18',
    coordinate: { lat: 55.5982208, lon: 12.9776597 },
    useContentCleaner: false,
  },
  {
    title: 'Pink Head Noodle Bar',
    url: 'https://weiq.app/pinkhead1/meny',
    imageUrl: 'https://pinkhead.se/wp-content/uploads/2025/01/DSC07736-5-scaled.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/L7GnCU9xwSTiyfSZ7',
    coordinate: { lat: 55.606587, lon: 12.9781294 },
  },
  {
    title: 'Kajuteriet',
    url: 'https://www.kajuteriet.se/lunchmeny-limhamn',
    imageUrl:
      'https://static.wixstatic.com/media/75cd00_f18863e929b54c5a9bfde6edf67de3fd~mv2.jpg/v1/crop/x_0,y_169,w_1284,h_670/fill/w_909,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Visa%20senaste%20bilder_edited.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/kDJWCHgwhnr89EDk8',
    coordinate: { lat: 55.5820819, lon: 12.9015044 },
  },
  {
    title: 'Boru bowl',
    url: 'https://www.borubowlbar.com/menu/',
    imageUrl: 'https://usercontent.one/wp/www.borubowlbar.com/wp-content/uploads/2019/03/IMG_5494.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/YVzTnsZikrSNHSLt6',
    coordinate: { lat: 55.5982571, lon: 12.9913518 },
    useContentCleaner: false,
  },
  {
    title: 'Ur vår jord',
    url: 'https://www.urvarjord.se/menus',
    imageUrl:
      'https://static.wixstatic.com/media/ee5a3f_4da7f93ddc24481cab5d3b361db75b46~mv2.jpg/v1/fill/w_980,h_320,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ee5a3f_4da7f93ddc24481cab5d3b361db75b46~mv2.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/fN2ZLGe2fpH1i1Sr5',
    coordinate: { lat: 55.5966722, lon: 13.0000889 },
  },
  {
    title: 'Byn matbar',
    url: 'https://bynmatbar.se/meny/',
    imageUrl: 'https://lh3.googleusercontent.com/p/AF1QipOW3E33RI7D150klP22EI-VTur0HIfPG7cJI_Ek=w600-h988-p-k-no',
    googleMapsUrl: 'https://maps.app.goo.gl/aEu4ZgrVqdsYdxzJ6',
    coordinate: { lat: 55.6076746, lon: 13.0211793 },
    useContentCleaner: false,
  },
  {
    title: 'Restaurang P2',
    url: 'https://restaurangp2.se/#lunch',
    imageUrl: 'https://restaurangp2.se/wp-content/uploads/2024/10/RESTAURANG_P2-6.webp',
    googleMapsUrl: 'https://maps.app.goo.gl/ZSF3vZKajQBtBWSS8',
    coordinate: { lat: 55.6143387, lon: 12.9857794 },
    useContentCleaner: false,
  },
];
