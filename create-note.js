import dotenv from "dotenv";
import axios from "axios";
import fetch from "node-fetch";
import FormData from "form-data";
import { parse, format } from 'date-fns';

import { generateId, generateContentElement ,generatePromoItems,handleDynamicWebPage} from "./utils.js";

dotenv.config();

const site = process.env.SITE;

const TOKENSANDBOX = process.env.ACCESS_TOKEN_SANDBOX;

const BASE_SANDBOX = `https://api.sandbox.${site}.arcpublishing.com`;
const BASE_PHOTO_API = `https://api.sandbox.${site}.arcpublishing.com/photo/api/v2/photos`;


const headersSandbox = {
  Authorization: "Bearer " + TOKENSANDBOX,
  "Content-Type": "application/json",
  Accept: "application/json",
  
};


const fecha = new Date();
const fechaISO = fecha.toISOString();

const { data, imagen_mapa } = await handleDynamicWebPage();

const buffer = Buffer.from(imagen_mapa);


const form = new FormData()

form.append("file", buffer, {
  filename: "mapa.png",
  contentType: "image/png",
  knownLength: buffer.length
});


const response = await axios.post(BASE_PHOTO_API, form, {
  headers: {
    Authorization: "Bearer " + TOKENSANDBOX,
    ...form.getHeaders()
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

const idImageGenerated = await response?.data?._id

const { reporte_sismico,censis, fecha_hora,latitud_longitud,profundidad,intensidad,reference,magnitud} = data;

// generacion latitud y longitud
const partesLL = latitud_longitud.split(': ')
const [latitud, longitud] = partesLL[1].split(', ')

// generacion de titulo
let ubicacion ="Perú" 
const partes = reference.split(',');
if (partes.length > 1) {
    ubicacion = partes[1].trim().replace(/\s+/g, '');
}
const partesFecha = fecha_hora.split(': ');
const soloFecha = partesFecha[1].split(' ')[0];
const soloHora = partesFecha[1].split(' ')[1];
const fechaDate = parse(partesFecha[1], 'dd/MM/yyyy HH:mm:ss', new Date());
const dia_mes= format(fechaDate, "d 'de' MMMM");

const title = `Temblor en ${ubicacion} hoy, ${dia_mes}:hora exacta y lugar del epicentro del último sismo vía IGP`
const subtitulo = censis
const tags = "tag1, tag2, tag3"


const ans = {
      "additional_properties": {
          "has_published_copy": true,
          "is_published": true,
          "publish_date": fechaISO
      },
      "canonical_website": "elcomercio",
      "content_elements": [
      ],
      "content_restrictions": {
          "content_code": "free"
      },
      "created_date": fechaISO,
      "credits": {
          "by": [
              {
                  "referent": {
                      "id": "redaccion-prueba",
                      "provider": "",
                      "referent_properties": {},
                      "type": "author"
                  },
                  "type": "reference"
              }
          ]
      },
      "display_date": fechaISO,
      "distributor": {
          "category": "staff",
          "name": "elcomercio",
          "subcategory": ""
      },
      "first_publish_date": fechaISO,
      "headlines": {
          "basic": title,
          "meta_title": title,
          "mobile": "",
          "native": "",
          "print": "",
          "tablet": "",
          "web": ""
      },
      "last_updated_date": fechaISO,
      "owner": {
          "id": "sandbox.elcomercio",
          "sponsored": false
      },
      "planning": {
          "story_length": {
              "character_count_actual": 17,
              "inch_count_actual": 1,
              "line_count_actual": 1,
              "word_count_actual": 3
          }
      },
      "promo_items":{
        "basic":{}
      },
      "publish_date": fechaISO,
      "related_content": {
          "basic": [],
          "clonedChildren": [],
          "clonedFromParent": []
      },
      "revision": {
          "branch": "default",
          "editions": [
              "default"
          ],
          "parent_id": "2WA343NUJRAA7OFIBNR7WVCZRE",
          "published": true,
          "revision_id": "OVTEYSJSJNA5RBMGMK5I3VZUXI",
          "user_id": "leonel.navarro@fractalservicios.pe"
      },
      "source": {
          "name": "elcomercio",
          "source_type": "staff",
          "system": "composer"
      },
      "subheadlines": {
          "basic": subtitulo
      },
      "subtype": "gallery_slider",
      "type": "story",
      "version": "0.10.10",
      "workflow": {
          "note": "",
          "status_code": 1
      }
}

if (tags) { 
  const tagsArray = tags.split(",").map(tag => tag.trim());
  ans.taxonomy = ans.taxonomy || {};
  ans.taxonomy.seo_keywords = tagsArray;
}

// Añadir un elemento tipo lista
ans.content_elements.push(generateContentElement({
  type: "list",
  listItems: [
    '<a href="https://example.com/1">Primer enlace</a>',
    '<a href="https://example.com/2">Segundo enlace</a>'
  ]
}));

// Añadir elementos tipo texto
const textItems = [
  `Reporte sísmico: ${reporte_sismico}`,
  `Fecha: ${soloFecha}`,
  `Hora: ${soloHora}`,
  `Magnitud: ${magnitud}`,
  `Epicentro: ${reference}`,
  `Latitud: ${latitud}`,
  `Longitud: ${longitud}`,
  `${profundidad}`,
  `${intensidad}`,
];
// Agregar los elementos de texto al contenido
textItems.forEach(text => {
  ans.content_elements.push(generateContentElement({
    type: "text",
    content: text
  }));
});

const newPromoItem = {
  id: idImageGenerated,
  provider:"comercio",
  type_image:"image"
}

const promoItem = generatePromoItems({
  id:newPromoItem.id,
  provider:newPromoItem.provider,
  type_image:newPromoItem.type_image,
});

ans.promo_items.basic =  promoItem ;

const sandboxResponse = await fetch(`${BASE_SANDBOX}/draft/v1/story/`, {
  method: "POST",
  body: JSON.stringify(ans),
  headers: headersSandbox,
});
const res = await sandboxResponse.json();


console.log(res);
