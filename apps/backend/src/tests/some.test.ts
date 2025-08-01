import 'dotenv/config';
import { getUnswRestaurants } from "../services/unsw.service";

async function testGetUnswRestaurants() {
  try {
    const res = await getUnswRestaurants();

    console.log("UNSW Restaurants:", JSON.parse(res));
  } catch (error) {
    console.error("Error fetching UNSW restaurants:", error);
  }
}

testGetUnswRestaurants();