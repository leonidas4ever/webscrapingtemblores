import { nanoid } from 'nanoid';
import puppeteer from "puppeteer";

export async function handleDynamicWebPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
  });
  const page = await browser.newPage();
  await page.goto("https://ultimosismo.igp.gob.pe/");

  await page.waitForSelector("#map");

  const data = await page.evaluate(() => {

    const reportElement = document.querySelector("div.d-flex.align-items-center.gap-2.text-secondary span:nth-of-type(2)");
    const reporte_sismico = reportElement ? reportElement.innerText : '';

    const censisElement = document.querySelector(".flex-fill.pt-xl-5.pt-lg-5.pt-md-2.pt-2.pb-3 app-seismic-preview .container .row .col p");
    const censis = censisElement ? censisElement.innerText : '';

    const fechaHoraElement = document.querySelector(".col-lg-7.p-0 p:first-of-type");
    const fecha_hora = fechaHoraElement ? fechaHoraElement.innerText : '';

    const latitudLongitudElement = document.querySelector(".col-lg-7.p-0 p:nth-of-type(2)");
    const latitud_longitud = latitudLongitudElement ? latitudLongitudElement.innerText : '';

    const profundidadElement = document.querySelector(".col-lg-5.p-0 p:first-of-type"); 
    const profundidad = profundidadElement ? profundidadElement.innerText : '';

    const intensidadElement = document.querySelector(".col-lg-5.p-0 p:nth-of-type(2)");
    const intensidad = intensidadElement ? intensidadElement.innerText : '';

    const referenceElement = document.querySelector(".reference span");
    const reference = referenceElement ? referenceElement.innerText : '';

    const magnitudElement = document.querySelector("div.mg-us.bg-green.text-white strong span");
    const magnitud = magnitudElement ? magnitudElement.innerText : '';



    return {
      reporte_sismico,
      censis,
      fecha_hora,
      latitud_longitud,
      profundidad,
      intensidad,
      reference,
      magnitud
    };
  });

  const imagen_mapa = await page.$("#map").then(async (element) => {
    if (element) {
      const screenshotBuffer = await element.screenshot();
      return screenshotBuffer; 
    } else {
      throw new Error("Elemento no encontrado");
    }
  });

  await browser.close();
  return { data, imagen_mapa }
}


export const generateId = () => {
  return nanoid(26);
}

export const generateContentElement = ({ type = "text", content, listItems = [] }) => {
  
    if (type === "list") {
        return {
          _id: generateId(),
          type: "list",
          list_type: "unordered",
          items: listItems.map(itemContent => ({
            _id: generateId(),
            type: "text",
            alignment: "left",
            content: itemContent,
            additional_properties: {
              comments: [],
              indent: 0,
              inline_comments: []
            }
          }))
        };
      } else if (type === "raw_html") {
        return {
          _id: generateId(),
          type: "raw_html",
          content: content, 
          additional_properties: {
            comments: [],
            inline_comments: []
          }
        };
      } else {
        return {
          _id: generateId(),
          type: type,
          content: content,
          additional_properties: {
            comments: [],
            inline_comments: []
          }
        };
      }
  }

  export const generatePromoItems = ({  id,provider,type_image }) => {
  
      return {
        _id: id,
        referent:{
          "id": id,
          "provider":provider,
          "referent_properties":{},
          "type":type_image
        },
        type:"reference"
      };
 
  }
