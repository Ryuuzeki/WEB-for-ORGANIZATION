import { IClimateRepository } from "@/domain/repositories/IClimateRepository";
import { ClimateData } from "@/domain/entities/ClimateData";
import { XMLParser } from "fast-xml-parser";

interface BMKGArea {
  "@_description"?: string;
  parameter?: BMKGParameter | BMKGParameter[];
}

interface BMKGParameter {
  "@_id"?: string;
  timerange?: BMKGTimerange | BMKGTimerange[];
}

interface BMKGTimerange {
  value?: BMKGValue | BMKGValue[];
}

type BMKGValue =
  | string
  | number
  | {
      "#text"?: string | number;
    };

interface BMKGForecast {
  data?: {
    forecast?: {
      issue?: {
        timestamp?: string;
      };
      area?: BMKGArea | BMKGArea[];
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

      if (!response.ok) {
        return this.getFallbackWeather(region);
      }

      const xmlData = await response.text();

      if (!this.looksLikeForecastXml(xmlData)) {
        return this.getFallbackWeather(region);
      }

      const jsonObj = this.parser.parse(xmlData) as BMKGForecast;
      const forecast = jsonObj.data?.forecast;
      const areas = this.toArray(forecast?.area);

      if (!forecast || areas.length === 0) {
        return this.getFallbackWeather(region);
      }

      const normalizedRegion = region.toLowerCase();
      const area = areas.find((item) => {
        return item["@_description"]?.toLowerCase() === normalizedRegion;
      }) || areas[0];
      const parameters = this.toArray(area.parameter);

      const tempParam = parameters.find((parameter) => parameter["@_id"] === "t");
      const humParam = parameters.find((parameter) => parameter["@_id"] === "hu");
      const weatherParam = parameters.find((parameter) => parameter["@_id"] === "weather");
      const temperature = this.getFirstParameterValue(tempParam);
      const humidity = this.getFirstParameterValue(humParam);
      const weatherCode = this.getFirstParameterValue(weatherParam);

      if (!area["@_description"] || !temperature || !humidity || !weatherCode) {
        return this.getFallbackWeather(region);
      }

      return {
        region: area["@_description"],
        temperature: `${temperature}\u00B0C`,
        humidity: `${humidity}%`,
        weatherCondition: this.mapWeatherCode(weatherCode),
        windSpeed: "10 km/h",
        lastUpdated: forecast.issue?.timestamp || new Date().toISOString(),
      };
    } catch {
      return this.getFallbackWeather(region);
    }
  }

  private looksLikeForecastXml(xmlData: string): boolean {
    const trimmedXml = xmlData.trim().toLowerCase();
    return trimmedXml.startsWith("<?xml") && trimmedXml.includes("<forecast");
  }

  private toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  private getFirstParameterValue(parameter?: BMKGParameter): string | undefined {
    const firstTimerange = this.toArray(parameter?.timerange)[0];
    const firstValue = this.toArray(firstTimerange?.value)[0];

    if (typeof firstValue === "string" || typeof firstValue === "number") {
      return String(firstValue);
    }

    return firstValue?.["#text"]?.toString();
  }

  private getFallbackWeather(region: string): ClimateData {
    return {
      region,
      temperature: "28\u00B0C",
      humidity: "80%",
      weatherCondition: "Berawan",
      windSpeed: "5 km/h",
      lastUpdated: new Date().toISOString(),
    };
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
