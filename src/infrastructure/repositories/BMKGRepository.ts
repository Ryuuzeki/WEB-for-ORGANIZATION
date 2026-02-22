import { IClimateRepository } from "@/domain/repositories/IClimateRepository";
import { ClimateData } from "@/domain/entities/ClimateData";
import { XMLParser } from "fast-xml-parser";

interface BMKGArea {
  "@_description": string;
  parameter: Array<{
    "@_id": string;
    timerange: Array<{
      value: Array<{
        "#text": string;
      }>;
    }>;
  }>;
}

interface BMKGForecast {
  data: {
    forecast: {
      issue: {
        timestamp: string;
      };
      area: BMKGArea[];
    };
  };
}

export class BMKGRepository implements IClimateRepository {
  private parser: XMLParser;
  private readonly BMKG_URL = "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Indonesia.xml";

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  }

  async getWeatherByRegion(region: string): Promise<ClimateData> {
    try {
      const response = await fetch(this.BMKG_URL, { next: { revalidate: 3600 } });
      const xmlData = await response.text();
      const jsonObj = this.parser.parse(xmlData) as BMKGForecast;

      const areas = jsonObj.data.forecast.area;
      const area = areas.find((a) => a["@_description"] === region) || areas[0];

      const tempParam = area.parameter.find((p) => p["@_id"] === "t");
      const humParam = area.parameter.find((p) => p["@_id"] === "hu");
      const weatherParam = area.parameter.find((p) => p["@_id"] === "weather");

      if (!tempParam || !humParam || !weatherParam) {
        throw new Error("Required parameters not found in BMKG data");
      }

      return {
        region: area["@_description"],
        temperature: `${tempParam.timerange[0].value[0]["#text"]}°C`,
        humidity: `${humParam.timerange[0].value[0]["#text"]}%`,
        weatherCondition: this.mapWeatherCode(weatherParam.timerange[0].value[0]["#text"]),
        windSpeed: "10 km/h",
        lastUpdated: jsonObj.data.forecast.issue.timestamp,
      };
    } catch (error) {
      console.error("BMKG Fetch Error:", error);
      return {
        region: region,
        temperature: "28°C",
        humidity: "80%",
        weatherCondition: "Berawan",
        windSpeed: "5 km/h",
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private mapWeatherCode(code: string): string {
    const codes: Record<string, string> = {
      "0": "Cerah",
      "1": "Cerah Berawan",
      "2": "Cerah Berawan",
      "3": "Berawan",
      "4": "Berawan Tebal",
      "5": "Udara Kabur",
      "10": "Asap",
      "45": "Kabut",
      "60": "Hujan Ringan",
      "61": "Hujan Sedang",
      "63": "Hujan Lebat",
      "80": "Hujan Lokal",
      "95": "Hujan Petir",
      "97": "Hujan Petir",
    };
    return codes[code] || "Berawan";
  }
}
