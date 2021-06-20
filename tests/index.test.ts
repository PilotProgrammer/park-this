import { connectFromLocal, Spot, Vehicle } from '../src'
import { SpotType } from '../src/entities/SpotType';
import { VehicleType } from '../src/entities/VehicleType';

it("test", async() => {
  const conn = await connectFromLocal();

  const spotRepo = conn.getRepository(Vehicle);

  const spot = new Vehicle();
  spot.color = "red";
  spot.licensePlateNumber = "123asdf"
  spot.name = "Camero";
  spot.vehicleType = VehicleType.Automobile
  await spotRepo.save(spot);
  console.log("hello!")
})