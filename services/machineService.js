const machineRepository = require('../repositories/machinerepository')

const MachineService = {
  getMachines: async () => {
    const machines = await machineRepository.getMachines(id);
    console.log(machines);
  },
};

module.exports = MachineService;
