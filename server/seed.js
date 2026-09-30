const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const Clinic = require('./src/models/Clinic');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Prescription = require('./src/models/Prescription');
const Medicine = require('./src/models/Medicine');
const FollowUp = require('./src/models/FollowUp');
const Notification = require('./src/models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinicocr';

const clinicData = {
  name: 'City Health Clinic',
  address: '123 Medical Avenue, Mumbai, India',
  phone: '+91-9876543210',
  email: 'info@cityhealthclinic.com',
  settings: {
    reportHeader: 'City Health Clinic - Medical Report',
    reportFooter: 'This is a computer-generated report. Please consult your doctor for medical advice.',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
  },
};

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@clinic.com',
    password: 'password123',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+91-9000000001',
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'doctor@clinic.com',
    password: 'password123',
    role: 'DOCTOR',
    status: 'ACTIVE',
    phone: '+91-9000000002',
    specialization: 'General Medicine',
    professionalInfo: 'MBBS, MD - 10 years experience',
  },
  {
    name: 'Priya Sharma',
    email: 'staff@clinic.com',
    password: 'password123',
    role: 'RECEPTIONIST',
    status: 'ACTIVE',
    phone: '+91-9000000003',
  },
  {
    name: 'Rahul Patel',
    email: 'patient@clinic.com',
    password: 'password123',
    role: 'PATIENT',
    status: 'ACTIVE',
    phone: '+91-9000000004',
  },
  {
    name: 'Amit Kumar',
    email: 'patient2@clinic.com',
    password: 'password123',
    role: 'PATIENT',
    status: 'ACTIVE',
    phone: '+91-9000000005',
  },
];

const samplePatients = [
  {
    name: 'Rahul Patel',
    phone: '+91-9000000004',
    email: 'patient@clinic.com',
    gender: 'MALE',
    age: 35,
    bloodGroup: 'O+',
    address: '456 Health Street, Mumbai',
    medicalHistory: 'No significant medical history',
    allergies: [],
  },
  {
    name: 'Amit Kumar',
    phone: '+91-9000000005',
    email: 'patient2@clinic.com',
    gender: 'MALE',
    age: 42,
    bloodGroup: 'A+',
    address: '789 Wellness Road, Mumbai',
    medicalHistory: 'Hypertension - controlled with medication',
    allergies: ['Penicillin'],
  },
  {
    name: 'Sneha Reddy',
    phone: '+91-9000000006',
    gender: 'FEMALE',
    age: 28,
    bloodGroup: 'B+',
    address: '321 Care Lane, Mumbai',
    medicalHistory: 'Type 2 Diabetes',
    allergies: [],
  },
  {
    name: 'Vikram Singh',
    phone: '+91-9000000007',
    gender: 'MALE',
    age: 55,
    bloodGroup: 'AB+',
    address: '12 Park View Colony, Delhi',
    medicalHistory: 'Chronic kidney disease stage 2',
    allergies: ['Sulfa drugs', 'Aspirin'],
  },
  {
    name: 'Anjali Desai',
    phone: '+91-9000000008',
    gender: 'FEMALE',
    age: 31,
    bloodGroup: 'A-',
    address: '88 Lake Gardens, Kolkata',
    medicalHistory: 'Asthma - uses inhaler as needed',
    allergies: ['Dust', 'Pollen'],
  },
  {
    name: 'Rohan Joshi',
    phone: '+91-9000000009',
    gender: 'MALE',
    age: 67,
    bloodGroup: 'O-',
    address: '55 Sunrise Nagar, Pune',
    medicalHistory: 'Type 2 Diabetes, Coronary artery disease, Post stent placement',
    allergies: [],
  },
  {
    name: 'Meera Nair',
    phone: '+91-9000000010',
    gender: 'FEMALE',
    age: 45,
    bloodGroup: 'B-',
    address: '23 Coconut Street, Kochi',
    medicalHistory: 'Hypothyroidism - on Levothyroxine',
    allergies: ['Iodine contrast'],
  },
  {
    name: 'Karan Malhotra',
    phone: '+91-9000000011',
    gender: 'MALE',
    age: 22,
    bloodGroup: 'A+',
    address: '67 Hill Road, Shimla',
    medicalHistory: 'No significant medical history',
    allergies: [],
  },
  {


    
    name: 'Pooja Verma',
    phone: '+91-9000000012',
    gender: 'FEMALE',
    age: 38,
    bloodGroup: 'O+',
    address: '34 Gandhi Marg, Jaipur',
    medicalHistory: 'Migraine - episodic, GERD',
    allergies: ['NSAIDs'],
  },
  {
    name: 'Arjun Reddy',
    phone: '+91-9000000013',
    gender: 'MALE',
    age: 50,
    bloodGroup: 'AB-',
    address: '90 Banjara Hills, Hyderabad',
    medicalHistory: 'Liver cirrhosis - Child-Pugh A, Chronic hepatitis B',
    allergies: ['Metformin'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  try {
    let clinic = await Clinic.findOne({ name: clinicData.name });
    if (!clinic) {
      clinic = await Clinic.create(clinicData);
      console.log('Created clinic:', clinic.name);
    } else {
      console.log('Clinic already exists:', clinic.name);
    }

    const users = [];
    for (const u of demoUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create({ ...u, clinicId: clinic._id });
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        if (!existing.clinicId) {
          existing.clinicId = clinic._id;
          await existing.save();
          console.log(`Updated clinicId for: ${u.email}`);
        }
        console.log(`User already exists: ${u.email}`);
      }
      users.push(existing);
    }

    const admin = users.find((u) => u.role === 'ADMIN');
    const doctor = users.find((u) => u.role === 'DOCTOR');
    const staff = users.find((u) => u.role === 'RECEPTIONIST');
    const patientUser = users.find((u) => u.email === 'patient@clinic.com');
    const patientUser2 = users.find((u) => u.email === 'patient2@clinic.com');

    const patients = [];
    for (const p of samplePatients) {
      let existing = await Patient.findOne({ phone: p.phone, clinicId: clinic._id });
      if (!existing) {
        const linkedUser = p.email ? users.find((u) => u.email === p.email) : null;
        existing = await Patient.create({
          ...p,
          clinicId: clinic._id,
          assignedDoctor: doctor._id,
          userId: linkedUser?._id,
        });
        console.log(`Created patient: ${p.name}`);
      } else {
        console.log(`Patient already exists: ${p.name}`);
      }
      patients.push(existing);
    }

    const prescriptions = [];
    const samplePrescriptions = [
      {
        patientId: patients[0]._id,
        doctorId: doctor._id,
        clinicId: clinic._id,
        processingStatus: 'APPROVED',
        doctorReview: { status: 'APPROVED', reviewedBy: doctor._id, reviewedAt: new Date() },
        ai: {
          correctedText: 'Tab Amoxicillin 500mg - 1 tablet TID x 7 days\nTab Paracetamol 650mg - 1 tablet PRN for fever\nSyrup Cetirizine 5ml - once daily x 5 days',
          summary: 'Patient presenting with upper respiratory infection. Prescribed antibiotics and symptomatic treatment.',
          medicines: [
            { name: 'Amoxicillin', dosage: '500mg', frequency: 'TID', duration: '7 days', confidence: 95 },
            { name: 'Paracetamol', dosage: '650mg', frequency: 'PRN', duration: 'As needed', confidence: 90 },
            { name: 'Cetirizine', dosage: '5ml', frequency: 'Once daily', duration: '5 days', confidence: 88 },
          ],
          importantFindings: ['Upper respiratory infection', 'No allergies reported'],
          tags: ['antibiotic', 'respiratory', 'fever'],
          extractionTime: 2500,
        },
        doctorNotes: 'Patient advised to complete full course of antibiotics.',
        prescriptionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        important: false,
      },
      {
        patientId: patients[0]._id,
        doctorId: doctor._id,
        clinicId: clinic._id,
        processingStatus: 'APPROVED',
        doctorReview: { status: 'APPROVED', reviewedBy: doctor._id, reviewedAt: new Date() },
        ai: {
          correctedText: 'Tab Metformin 500mg - 1 tablet BID with meals\nTab Amlodipine 5mg - once daily\nTab Aspirin 75mg - once daily',
          summary: 'Follow-up for diabetes and hypertension management. Continuing current medications.',
          medicines: [
            { name: 'Metformin', dosage: '500mg', frequency: 'BID', duration: 'Ongoing', confidence: 92 },
            { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', confidence: 94 },
            { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: 'Ongoing', confidence: 96 },
          ],
          importantFindings: ['Diabetes management', 'Blood pressure control'],
          tags: ['diabetes', 'hypertension', 'chronic'],
          extractionTime: 2200,
        },
        doctorNotes: 'Continue current regimen. HbA1c check in 3 months.',
        prescriptionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        important: true,
      },
      {
        patientId: patients[1]._id,
        doctorId: doctor._id,
        clinicId: clinic._id,
        processingStatus: 'APPROVED',
        doctorReview: { status: 'APPROVED', reviewedBy: doctor._id, reviewedAt: new Date() },
        ai: {
          correctedText: 'Tab Losartan 50mg - once daily\nTab Metformin 500mg - 1 tablet BID',
          summary: 'Hypertension and diabetes follow-up. Adjusting dosage.',
          medicines: [
            { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: 'Ongoing', confidence: 91 },
            { name: 'Metformin', dosage: '500mg', frequency: 'BID', duration: 'Ongoing', confidence: 93 },
          ],
          importantFindings: ['Blood pressure elevated', 'Continue diabetes medication'],
          tags: ['hypertension', 'diabetes'],
          extractionTime: 1800,
        },
        doctorNotes: 'Blood pressure slightly elevated. Continue medication.',
        prescriptionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        important: false,
      },
    ];

    for (const p of samplePrescriptions) {
      const existing = await Prescription.findOne({
        patientId: p.patientId,
        clinicId: clinic._id,
        prescriptionDate: p.prescriptionDate,
      });
      if (!existing) {
        const presc = await Prescription.create(p);
        prescriptions.push(presc);
        console.log(`Created prescription for patient ${p.patientId}`);

        if (presc.ai?.medicines) {
          const medDocs = presc.ai.medicines.map((m) => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            confidence: m.confidence,
            prescriptionId: presc._id,
            patientId: presc.patientId,
            clinicId: presc.clinicId,
          }));
          await Medicine.insertMany(medDocs);
          console.log(`Created ${medDocs.length} medicine records`);
        }
      } else {
        console.log('Prescription already exists, skipping');
      }
    }

    const sampleFollowUps = [
      {
        patientId: patients[0]._id,
        doctorId: doctor._id,
        clinicId: clinic._id,
        prescriptionId: prescriptions[0]?._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'Follow-up for respiratory infection treatment',
        notes: 'Check if infection has cleared',
        status: 'UPCOMING',
      },
      {
        patientId: patients[1]._id,
        doctorId: doctor._id,
        clinicId: clinic._id,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        reason: 'Diabetes and hypertension review',
        notes: 'Check HbA1c and blood pressure',
        status: 'UPCOMING',
      },
    ];

    for (const f of sampleFollowUps) {
      const existing = await FollowUp.findOne({
        patientId: f.patientId,
        clinicId: clinic._id,
        date: f.date,
      });
      if (!existing) {
        await FollowUp.create(f);
        console.log(`Created follow-up for patient ${f.patientId}`);
      }
    }

    console.log('\nSeed complete!');
    console.log('\n--- Demo Credentials ---');
    console.log('Admin:        admin@clinic.com / password123');
    console.log('Doctor:       doctor@clinic.com / password123');
    console.log('Receptionist: staff@clinic.com / password123');
    console.log('Patient:      patient@clinic.com / password123');
    console.log('Patient 2:    patient2@clinic.com / password123');
    console.log('------------------------\n');

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
