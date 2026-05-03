const Clinic = require('../models/Clinic');

exports.getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find({}).populate('ownerRef', 'name email');
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClinic = async (req, res) => {
  try {
    if (req.user.role !== 'vet' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only vets can create clinics' });
    }
    const { name, address, specializations, availableSlots, timings } = req.body;
    
    // For MVP, location defaults to some point if not provided
    const clinic = await Clinic.create({
      name,
      ownerRef: req.user.id,
      address,
      specializations,
      availableSlots,
      timings,
      isVerified: false
    });

    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
