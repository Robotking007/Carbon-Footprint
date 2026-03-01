// ─── Emission Factors Database ───
// Sources: electricitymap.org, greeneatz.com, GHG Protocol, IPCC

const emissionFactors = {
  // ─── Travel (kg CO2 per km) ───
  travel: {
    car_petrol: 0.192,
    car_diesel: 0.171,
    car_cng: 0.129,
    car_electric: 0.053,
    motorcycle: 0.103,
    bus: 0.089,
    train_electric: 0.041,
    train_diesel: 0.072,
    auto_rickshaw: 0.075,
    bicycle: 0.0,
    walking: 0.0,
    flight_domestic: 0.255,
    flight_international: 0.195,
    metro: 0.033,
  },

  // ─── Electricity (kg CO2 per kWh by country) ───
  electricity: {
    india: 0.82,
    usa: 0.39,
    uk: 0.23,
    germany: 0.34,
    france: 0.06,
    china: 0.58,
    japan: 0.47,
    australia: 0.66,
    canada: 0.13,
    brazil: 0.07,
    default: 0.50,
  },

  // ─── Food (kg CO2 per kg of food) ───
  food: {
    beef: 27.0,
    lamb: 39.2,
    pork: 12.1,
    chicken: 6.9,
    fish: 6.1,
    cheese: 13.5,
    eggs: 4.8,
    rice: 2.7,
    wheat: 1.4,
    vegetables: 2.0,
    fruits: 1.1,
    milk_per_liter: 3.2,
    coffee: 28.5,
    chocolate: 19.0,
    tofu: 2.0,
    lentils: 0.9,
    nuts: 2.3,
  },

  // ─── Meal Types (kg CO2 per meal) ───
  meals: {
    vegetarian: 1.14,
    vegan: 0.7,
    non_vegetarian_chicken: 2.5,
    non_vegetarian_mutton: 3.8,
    non_vegetarian_fish: 2.0,
    average_indian: 1.3,
  },

  // ─── Streaming (kg CO2 per hour) ───
  streaming: {
    video_hd: 0.036,
    video_sd: 0.018,
    video_4k: 0.072,
    audio: 0.002,
    gaming: 0.045,
  },

  // ─── Waste (kg CO2 per kg) ───
  waste: {
    general_waste: 0.58,
    plastic: 2.53,
    paper_recycled: -1.0,
    glass_recycled: -0.31,
    metal_recycled: -1.8,
    organic_composted: -0.1,
    e_waste: 3.25,
  },

  // ─── Shopping (kg CO2 per item/unit) ───
  shopping: {
    clothing_item: 10.0,
    smartphone: 70.0,
    laptop: 300.0,
    furniture_piece: 50.0,
    fast_fashion_item: 15.0,
  },

  // ─── Monthly Budgets by Country (kg CO2 per month) ───
  monthlyBudgets: {
    india: 158.0,    // ~1.9 tons/year target
    usa: 333.0,      // ~4.0 tons/year target
    uk: 250.0,       // ~3.0 tons/year target
    global_target: 200.0, // ~2.4 tons/year (Paris Agreement aligned)
    default: 200.0,
  },
};

module.exports = emissionFactors;
