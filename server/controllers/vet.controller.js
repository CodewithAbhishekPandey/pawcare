const Clinic = require('../models/Clinic');

// GET /api/vets?lat=&lng=&radius=&specialty=
exports.getNearbyVets = async (req, res) => {
  try {
    const { lat, lng, radius = 10000, specialty } = req.query;

    let query;

    if (lat && lng) {
      query = Clinic.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        }
      });
    } else {
      // Fallback: return all clinics if no location provided
      query = Clinic.find({});
    }

    if (specialty && specialty !== 'all') {
      query = query.where('specializations').in([specialty]);
    }

    const clinics = await query.populate('ownerRef', 'name email').lean();
    res.json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vets/mine  (vet gets their own clinic)
exports.getMyClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ ownerRef: req.user.id }).lean();
    if (!clinic) return res.status(404).json({ success: false, message: 'No clinic found for this vet' });
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vets/:id
exports.getVetById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate('ownerRef', 'name email').lean();
    if (!clinic) return res.status(404).json({ success: false, message: 'Clinic not found' });
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vets  (vet/admin only)
exports.createClinic = async (req, res) => {
  try {
    if (req.user.role !== 'vet' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only vets can create clinics' });
    }
    const { name, address, specializations, availableSlots, timings, location } = req.body;
    const clinic = await Clinic.create({
      name, ownerRef: req.user.id, address, specializations,
      availableSlots, timings, location, isVerified: false
    });
    res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
