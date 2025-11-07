import bcrypt from 'bcryptjs';
import { 
  User as MongoUser, 
  Fleet as MongoFleet, 
  Vehicle as MongoVehicle, 
  ServiceRequest as MongoServiceRequest, 
  Technician as MongoTechnician, 
  Service as MongoService,
  Invoice as MongoInvoice
} from '../schemas/index.js';
import { isMongoDatabase, getDatabase } from '../database/index.js';

// Main seeder class
export class DatabaseSeeder {
  constructor() {
    this.seededData = {
      fleets: [],
      users: [],
      vehicles: [],
      technicians: [],
      services: [],
      serviceRequests: [],
      invoices: []
    };
  }

  async seedAll() {
    try {
      console.log('🌱 Starting database seeding...');

      // Check if data already exists
      if (await this.hasExistingData()) {
        console.log('📊 Database already contains data, skipping seed');
        return { success: true, message: 'Database already seeded' };
      }

      // New order to break circular dependency between fleet.ownerId and user.fleetId:
      // 1. Create base admin user (no fleetId yet)
      // 2. Create fleets referencing admin as ownerId
      // 3. Update admin user with primary fleetId
      // 4. Create remaining users referencing fleets
      // 5. Vehicles, technicians, services, service requests
      await this.seedBaseAdmin();
      await this.seedFleets();
      await this.linkAdminToPrimaryFleet();
      await this.seedRemainingUsers();
      await this.seedVehicles();
      await this.seedTechnicians();
      await this.seedServices();
      await this.seedServiceRequests();
      await this.seedInvoices();

      console.log('✅ Database seeding completed successfully');
      return {
        success: true,
        message: 'Database seeded successfully',
        data: this.seededData
      };
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw new Error(`Seeding failed: ${error.message}`);
    }
  }

  async hasExistingData() {
    try {
      if (isMongoDatabase()) {
        const userCount = await MongoUser.countDocuments();
        return userCount > 0;
      } else {
        const db = getDatabase();
        const stats = db.getStats();
        return stats.users > 0 || stats.fleets > 0;
      }
    } catch (error) {
      console.warn('⚠️ Could not check for existing data:', error.message);
      return false;
    }
  }

  async seedFleets() {
    console.log('🏢 Seeding fleets...');
    
    const fleets = [
      {
        name: "Roll & Charge Main Fleet",
        description: "Primary electric vehicle fleet for Roll & Charge Fleet Management",
        ownerId: this.seededData.adminUser?._id || this.seededData.adminUser?.id,
        contactInfo: {
          email: "fleet@rollcharge.com",
          phone: "+15550123",
          address: {
            street: "123 Electric Avenue",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
            country: "US"
          }
        },
        status: "active",
        subscription: {
          plan: "premium",
          startDate: new Date(),
          isActive: true,
          features: [
            { name: "advanced_analytics", enabled: true, limit: 100 },
            { name: "mobile_service", enabled: true, limit: 50 },
            { name: "24_7_support", enabled: true }
          ]
        },
        settings: {
          timezone: "America/Los_Angeles",
          currency: "USD",
          notifications: {
            maintenanceReminders: true,
            serviceRequests: true,
            lowBattery: true,
            emergencies: true
          }
        }
      },
      {
        name: "Green City Transport",
        description: "Urban electric vehicle fleet for city transportation",
        ownerId: this.seededData.adminUser?._id || this.seededData.adminUser?.id,
        contactInfo: {
          email: "operations@greencity.com",
          phone: "+15550456",
          address: {
            street: "789 Green Street",
            city: "Portland",
            state: "OR",
            zipCode: "97201",
            country: "US"
          }
        },
        status: "active",
        subscription: {
          plan: "basic",
          startDate: new Date(),
          isActive: true,
          features: [
            { name: "basic_analytics", enabled: true, limit: 25 },
            { name: "standard_support", enabled: true }
          ]
        }
      }
    ];

    for (const fleetData of fleets) {
      let fleet;
      if (isMongoDatabase()) {
        fleet = new MongoFleet(fleetData);
        fleet = await fleet.save();
      } else {
        const db = getDatabase();
        fleet = db.create('fleets', fleetData);
      }
      this.seededData.fleets.push(fleet);
    }

    console.log(`✅ Seeded ${fleets.length} fleets`);
  }

  async seedBaseAdmin() {
    console.log('👤 Creating base admin user...');
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@rollcharge.com',
      password: 'admin123', // Plain text - will be hashed by User model pre-save hook
      role: 'admin',
      status: 'active',
      phone: '+15550100',
      emailVerified: true
    };
    let admin;
    if (isMongoDatabase()) {
      admin = new MongoUser(adminData);
      admin = await admin.save();
    } else {
      const db = getDatabase();
      admin = db.create('users', adminData);
    }
    this.seededData.adminUser = admin;
    this.seededData.users.push(admin);
    console.log('✅ Base admin user created');
  }

  async linkAdminToPrimaryFleet() {
    if (!this.seededData.adminUser || !this.seededData.fleets.length) return;
    const primaryFleet = this.seededData.fleets[0];
    if (isMongoDatabase()) {
      await MongoUser.updateOne({ _id: this.seededData.adminUser._id }, { $set: { fleetId: primaryFleet._id } });
    } else {
      this.seededData.adminUser.fleetId = primaryFleet.id;
    }
    console.log('🔗 Linked admin user to primary fleet');
  }

  async seedRemainingUsers() {
    console.log('👥 Seeding remaining users...');
    const users = [
      {
        firstName: 'Fleet',
        lastName: 'Manager',
        email: 'manager@rollcharge.com',
        password: 'manager123', // Plain text - will be hashed by User model pre-save hook
        role: 'fleet_manager',
        status: 'active',
        phone: '+15550101',
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        emailVerified: true
      },
      {
        firstName: 'John',
        lastName: 'Driver',
        email: 'john.driver@rollcharge.com',
        password: 'manager123', // Plain text - will be hashed by User model pre-save hook
        role: 'user',
        status: 'active',
        phone: '+15550102',
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        emailVerified: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Operations',
        email: 'sarah@greencity.com',
        password: 'manager123', // Plain text - will be hashed by User model pre-save hook
        role: 'fleet_manager',
        status: 'active',
        phone: '+15550789',
        fleetId: this.seededData.fleets[1]._id || this.seededData.fleets[1].id,
        emailVerified: true
      }
    ];

    for (const userData of users) {
      let user;
      if (isMongoDatabase()) {
        user = new MongoUser(userData);
        user = await user.save();
      } else {
        const db = getDatabase();
        user = db.create('users', userData);
      }
      this.seededData.users.push(user);
    }
    console.log(`✅ Seeded ${users.length} additional users`);
  }

  async seedVehicles() {
    console.log('🚗 Seeding vehicles...');
    
    const vehicles = [
      {
        vin: "1HGCM82633A123456",
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        color: "White",
        licensePlate: "EV-001-CA",
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        batteryInfo: {
          capacity: 75,
          currentLevel: 85,
          range: 358,
          chargingStatus: "not_charging",
          batteryHealth: 98
        },
        status: "active",
        location: {
          coordinates: [-122.4194, 37.7749], // San Francisco
          address: "Downtown Charging Station, San Francisco, CA"
        },
        maintenance: {
          mileage: 15000,
          serviceIntervalMiles: 10000,
          serviceIntervalMonths: 12
        },
        usage: {
          totalMiles: 15000,
          totalHours: 500,
          averageMilesPerDay: 50,
          utilizationRate: 75
        },
        purchaseInfo: {
          purchaseDate: new Date('2023-01-15'),
          purchasePrice: 45000,
          warrantyExpiry: new Date('2026-01-15')
        }
      },
      {
        vin: "1HGCM82633A789012",
        make: "Nissan",
        model: "Leaf",
        year: 2022,
        color: "Silver",
        licensePlate: "EV-002-CA",
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        batteryInfo: {
          capacity: 62,
          currentLevel: 92,
          range: 226,
          chargingStatus: "not_charging",
          batteryHealth: 95
        },
        status: "active",
        location: {
          coordinates: [-122.4094, 37.7849],
          address: "Main Depot, San Francisco, CA"
        },
        maintenance: {
          mileage: 28000,
          serviceIntervalMiles: 10000,
          serviceIntervalMonths: 12
        },
        usage: {
          totalMiles: 28000,
          totalHours: 900,
          averageMilesPerDay: 45,
          utilizationRate: 80
        }
      },
      {
        vin: "1HGCM82633A345678",
        make: "BMW",
        model: "iX3",
        year: 2023,
        color: "Blue",
        licensePlate: "EV-003-CA",
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        batteryInfo: {
          capacity: 80,
          currentLevel: 18, // Low battery for testing alerts
          range: 285,
          chargingStatus: "not_charging",
          batteryHealth: 100
        },
        status: "maintenance",
        location: {
          coordinates: [-122.3894, 37.7649],
          address: "Service Center A, San Francisco, CA"
        },
        maintenance: {
          mileage: 8500,
          serviceIntervalMiles: 10000,
          serviceIntervalMonths: 12,
          maintenanceAlerts: [{
            type: "battery_check",
            dueDate: new Date(),
            priority: "high",
            completed: false
          }]
        }
      },
      {
        vin: "5NPE34AF8JH123456",
        make: "Hyundai",
        model: "Kona Electric",
        year: 2022,
        color: "Red",
        licensePlate: "GC-001-OR",
        fleetId: this.seededData.fleets[1]._id || this.seededData.fleets[1].id,
        batteryInfo: {
          capacity: 64,
          currentLevel: 67,
          range: 258,
          chargingStatus: "not_charging",
          batteryHealth: 96
        },
        status: "active",
        location: {
          coordinates: [-122.6784, 45.5152], // Portland
          address: "City Center, Portland, OR"
        },
        maintenance: {
          mileage: 22000,
          serviceIntervalMiles: 10000,
          serviceIntervalMonths: 12
        }
      }
    ];

    for (const vehicleData of vehicles) {
      let vehicle;
      if (isMongoDatabase()) {
        vehicle = new MongoVehicle(vehicleData);
        vehicle = await vehicle.save();
      } else {
        const db = getDatabase();
        vehicle = db.create('vehicles', vehicleData);
      }
      this.seededData.vehicles.push(vehicle);
    }

    console.log(`✅ Seeded ${vehicles.length} vehicles`);
  }

  async seedTechnicians() {
    console.log('🔧 Seeding technicians...');
    
    const technicians = [
      {
        employeeId: "TECH001",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@rollcharge.com",
  phone: "+15550201",
        specializations: ["battery_systems", "charging_systems", "electrical_diagnostics"],
        certifications: [
          {
            name: "EV Certified Technician",
            issuingOrganization: "EV Institute",
            certificationNumber: "EV-2023-001",
            issueDate: new Date('2023-01-15'),
            expiryDate: new Date('2025-01-15'),
            isActive: true
          },
          {
            name: "Tesla Service Certified",
            issuingOrganization: "Tesla Inc.",
            certificationNumber: "TSC-2023-456",
            issueDate: new Date('2023-03-01'),
            expiryDate: new Date('2024-03-01'),
            isActive: true
          }
        ],
        skillLevel: "senior",
        yearsOfExperience: 5,
        hireDate: new Date('2022-01-15'),
        availability: {
          status: "available",
          maxConcurrentJobs: 3,
          currentJobCount: 0,
          workingHours: {
            monday: { start: "08:00", end: "17:00", working: true },
            tuesday: { start: "08:00", end: "17:00", working: true },
            wednesday: { start: "08:00", end: "17:00", working: true },
            thursday: { start: "08:00", end: "17:00", working: true },
            friday: { start: "08:00", end: "17:00", working: true },
            saturday: { start: "09:00", end: "13:00", working: true },
            sunday: { start: "", end: "", working: false }
          }
        },
        location: {
          homeBase: {
            coordinates: [-122.4194, 37.7749],
            address: "Service Center A, San Francisco, CA"
          },
          serviceRadius: 50
        },
        performance: {
          totalJobsCompleted: 125,
          averageJobTime: 2.5,
          customerRating: 4.8,
          onTimePercentage: 95,
          qualityScore: 98
        }
      },
      {
        employeeId: "TECH002",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@rollcharge.com",
  phone: "+15550202",
        specializations: ["software_programming", "electrical_diagnostics", "hvac_systems"],
        certifications: [
          {
            name: "BMW i Certified",
            issuingOrganization: "BMW Group",
            certificationNumber: "BMW-i-789",
            issueDate: new Date('2023-02-01'),
            expiryDate: new Date('2025-02-01'),
            isActive: true
          },
          {
            name: "Nissan EV Specialist",
            issuingOrganization: "Nissan Motor Co.",
            certificationNumber: "NIS-EV-456",
            issueDate: new Date('2022-11-15'),
            expiryDate: new Date('2024-11-15'),
            isActive: true
          }
        ],
        skillLevel: "senior",
        yearsOfExperience: 7,
        hireDate: new Date('2021-06-01'),
        availability: {
          status: "available",
          maxConcurrentJobs: 4,
          currentJobCount: 1
        },
        location: {
          homeBase: {
            coordinates: [-122.4094, 37.7849],
            address: "Service Center B, San Francisco, CA"
          },
          serviceRadius: 60
        },
        performance: {
          totalJobsCompleted: 200,
          averageJobTime: 3.2,
          customerRating: 4.9,
          onTimePercentage: 97,
          qualityScore: 99
        }
      },
      {
        employeeId: "TECH003",
        firstName: "Mike",
        lastName: "Davis",
        email: "mike.davis@rollcharge.com",
  phone: "+15550203",
        specializations: ["mechanical_repair", "brake_systems", "suspension", "tire_service"],
        certifications: [
          {
            name: "ASE Certified",
            issuingOrganization: "ASE - Automotive Service Excellence",
            certificationNumber: "ASE-A1-789",
            issueDate: new Date('2022-05-01'),
            expiryDate: new Date('2025-05-01'),
            isActive: true
          }
        ],
        skillLevel: "master",
        yearsOfExperience: 10,
        hireDate: new Date('2020-03-15'),
        availability: {
          status: "busy",
          maxConcurrentJobs: 2,
          currentJobCount: 2
        },
        location: {
          homeBase: {
            coordinates: [-122.3894, 37.7649],
            address: "Mobile Unit 1, San Francisco, CA"
          },
          serviceRadius: 75
        },
        performance: {
          totalJobsCompleted: 350,
          averageJobTime: 4.1,
          customerRating: 4.7,
          onTimePercentage: 93,
          qualityScore: 96
        }
      }
    ];

    for (const technicianData of technicians) {
      let technician;
      if (isMongoDatabase()) {
        technician = new MongoTechnician(technicianData);
        technician = await technician.save();
      } else {
        const db = getDatabase();
        technician = db.create('technicians', technicianData);
      }
      this.seededData.technicians.push(technician);
    }

    console.log(`✅ Seeded ${technicians.length} technicians`);
  }

  async seedServices() {
    console.log('🛠️ Seeding services...');
    
    const services = [
      {
        serviceCode: "BAT-001",
        name: "Battery Health Check",
        description: "Comprehensive battery performance and health assessment including capacity test, cell balance check, and thermal analysis",
        category: "battery_maintenance",
        serviceType: "maintenance",
        pricing: {
          basePrice: 89.99,
          pricingModel: "flat_rate",
          minimumCharge: 89.99
        },
        requirements: {
          estimatedDuration: { min: 45, max: 75 },
          skillLevelRequired: "junior",
          specializationRequired: ["battery_systems"],
          equipmentRequired: [
            { name: "Battery Tester", type: "diagnostic", essential: true },
            { name: "Multimeter", type: "diagnostic", essential: true }
          ]
        },
        availability: {
          enabled: true,
          mobileService: true,
          onSiteService: true
        },
        safety: {
          hazardLevel: "medium",
          safetyEquipmentRequired: ["Insulated Gloves", "Safety Glasses"],
          highVoltageWork: true
        },
        quality: {
          warrantyPeriod: 3,
          qualityChecksRequired: true
        },
        status: "active"
      },
      {
        serviceCode: "SW-001",
        name: "Software Update",
        description: "Latest firmware and software updates for vehicle systems, including infotainment, battery management, and safety systems",
        category: "software_update",
        serviceType: "upgrade",
        pricing: {
          basePrice: 0.00,
          pricingModel: "flat_rate"
        },
        requirements: {
          estimatedDuration: { min: 30, max: 60 },
          skillLevelRequired: "junior",
          specializationRequired: ["software_programming"],
          equipmentRequired: [
            { name: "OBD Scanner", type: "diagnostic", essential: true },
            { name: "Laptop with Software", type: "diagnostic", essential: true }
          ]
        },
        availability: {
          enabled: true,
          mobileService: false,
          onSiteService: true
        },
        safety: {
          hazardLevel: "low"
        },
        quality: {
          warrantyPeriod: 1,
          followUpRequired: true,
          followUpDays: 7
        },
        status: "active"
      },
      {
        serviceCode: "CHG-001",
        name: "Charging Port Inspection",
        description: "Thorough inspection and cleaning of charging port, connection diagnostics, and cable integrity check",
        category: "charging_system",
        serviceType: "inspection",
        pricing: {
          basePrice: 49.99,
          pricingModel: "flat_rate"
        },
        requirements: {
          estimatedDuration: { min: 20, max: 40 },
          skillLevelRequired: "junior",
          specializationRequired: ["charging_systems"],
          equipmentRequired: [
            { name: "Inspection Camera", type: "diagnostic", essential: false },
            { name: "Cleaning Kit", type: "hand_tool", essential: true }
          ]
        },
        availability: {
          enabled: true,
          mobileService: true,
          onSiteService: true
        },
        safety: {
          hazardLevel: "low",
          safetyEquipmentRequired: ["Safety Glasses"]
        },
        quality: {
          warrantyPeriod: 1
        },
        status: "active"
      },
      {
        serviceCode: "BRK-001",
        name: "Brake System Service",
        description: "Complete brake system inspection including pads, rotors, fluid, and regenerative braking system check",
        category: "brake_service",
        serviceType: "maintenance",
        pricing: {
          basePrice: 199.99,
          pricingModel: "diagnostic_plus_repair",
          laborRate: 125.00
        },
        requirements: {
          estimatedDuration: { min: 60, max: 120 },
          skillLevelRequired: "senior",
          specializationRequired: ["brake_systems", "mechanical_repair"],
          equipmentRequired: [
            { name: "Brake Fluid Tester", type: "diagnostic", essential: true },
            { name: "Lift", type: "specialized_equipment", essential: true }
          ],
          commonParts: [
            { partName: "Brake Pads", quantity: 1, estimatedCost: 75.00, optional: false },
            { partName: "Brake Fluid", quantity: 1, estimatedCost: 25.00, optional: true }
          ]
        },
        availability: {
          enabled: true,
          mobileService: false,
          onSiteService: true
        },
        safety: {
          hazardLevel: "medium",
          safetyEquipmentRequired: ["Safety Glasses", "Work Gloves"],
          liftRequired: true
        },
        quality: {
          warrantyPeriod: 6,
          qualityChecksRequired: true
        },
        status: "active"
      },
      {
        serviceCode: "TIR-001",
        name: "Tire Rotation & Alignment",
        description: "Professional tire rotation service with wheel alignment check and pressure optimization for electric vehicles",
        category: "tire_service",
        serviceType: "maintenance",
        pricing: {
          basePrice: 129.99,
          pricingModel: "flat_rate"
        },
        requirements: {
          estimatedDuration: { min: 45, max: 90 },
          skillLevelRequired: "junior",
          specializationRequired: ["tire_service"],
          equipmentRequired: [
            { name: "Tire Pressure Gauge", type: "hand_tool", essential: true },
            { name: "Alignment Equipment", type: "specialized_equipment", essential: true }
          ]
        },
        availability: {
          enabled: true,
          mobileService: true,
          onSiteService: true
        },
        safety: {
          hazardLevel: "low",
          safetyEquipmentRequired: ["Safety Glasses", "Steel-toe Boots"]
        },
        quality: {
          warrantyPeriod: 3,
          followUpRequired: true,
          followUpDays: 30
        },
        status: "active"
      }
    ];

    for (const serviceData of services) {
      let service;
      if (isMongoDatabase()) {
        service = new MongoService(serviceData);
        service = await service.save();
      } else {
        const db = getDatabase();
        service = db.create('services', serviceData);
      }
      this.seededData.services.push(service);
    }

    console.log(`✅ Seeded ${services.length} services`);
  }

  async seedServiceRequests() {
    console.log('📋 Seeding service requests...');
    
    // Create some service requests with different statuses
    const serviceRequests = [
      {
        title: "Routine Battery Check",
        description: "Routine maintenance check - battery seems to be charging slower than usual. Customer reports 20% longer charging times.",
        category: "battery_service",
        priority: "medium",
        urgency: "routine",
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        vehicleId: this.seededData.vehicles[0]._id || this.seededData.vehicles[0].id,
        requestedBy: this.seededData.users[1]._id || this.seededData.users[1].id,
        status: "pending",
        serviceType: "maintenance",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        preferredTimeSlot: { start: "09:00", end: "12:00" },
        serviceLocation: {
          type: "service_center",
          address: {
            street: "Service Center A",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105"
          }
        },
        costEstimate: {
          labor: 89.99,
          parts: 0,
          other: 0,
          tax: 8.10,
          total: 98.09
        }
      },
      {
        title: "Software Update Required",
        description: "Vehicle received software update notification for battery management system and infotainment. Critical security update included.",
        category: "software_update",
        priority: "high",
        urgency: "urgent",
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        vehicleId: this.seededData.vehicles[1]._id || this.seededData.vehicles[1].id,
        requestedBy: this.seededData.users[1]._id || this.seededData.users[1].id,
        assignedTechnician: this.seededData.technicians[1]._id || this.seededData.technicians[1].id,
        status: "in_progress",
        serviceType: "upgrade",
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        actualStartTime: new Date(),
        estimatedDuration: 1,
        serviceLocation: {
          type: "service_center",
          address: {
            street: "Service Center B",
            city: "San Francisco",
            state: "CA",
            zipCode: "94106"
          }
        },
        costEstimate: {
          labor: 0,
          parts: 0,
          other: 0,
          tax: 0,
          total: 0
        }
      },
      {
        title: "Emergency Brake Service",
        description: "URGENT: Brake warning light activated during operation. Vehicle reported grinding noise. Immediate safety inspection required.",
        category: "brake_service",
        priority: "critical",
        urgency: "emergency",
        fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
        vehicleId: this.seededData.vehicles[2]._id || this.seededData.vehicles[2].id,
        requestedBy: this.seededData.users[2]._id || this.seededData.users[2].id,
        assignedTechnician: this.seededData.technicians[2]._id || this.seededData.technicians[2].id,
        status: "completed",
        serviceType: "repair",
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        actualStartTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        actualEndTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        serviceLocation: {
          type: "service_center",
          address: {
            street: "Service Center A",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105"
          }
        },
        workPerformed: {
          description: "Replaced brake pads, resurfaced rotors, replaced brake fluid, tested regenerative braking system",
          procedures: [
            "Visual brake inspection",
            "Brake pad replacement - front and rear",
            "Rotor resurfacing",
            "Brake fluid flush and replacement",
            "Regenerative braking calibration",
            "Test drive and validation"
          ],
          recommendations: "Schedule brake inspection every 6 months due to heavy usage",
          warrantyInfo: {
            covered: true,
            warrantyPeriod: 6,
            warrantyExpiry: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
          }
        },
        costEstimate: {
          labor: 200.00,
          parts: 150.00,
          other: 25.00,
          tax: 33.75,
          total: 408.75
        },
        actualCost: {
          labor: 200.00,
          parts: 165.00,
          other: 25.00,
          tax: 35.10,
          total: 425.10
        },
        billingStatus: "invoiced",
        customerFeedback: {
          rating: 5,
          comments: "Excellent service! Mike was professional and explained everything clearly. Vehicle feels much safer now.",
          wouldRecommend: true,
          submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    for (const requestData of serviceRequests) {
      let serviceRequest;
      if (isMongoDatabase()) {
        serviceRequest = new MongoServiceRequest(requestData);
        serviceRequest = await serviceRequest.save();
      } else {
        const db = getDatabase();
        serviceRequest = db.create('serviceRequests', requestData);
      }
      this.seededData.serviceRequests.push(serviceRequest);
    }

    console.log(`✅ Seeded ${serviceRequests.length} service requests`);
  }

  async seedInvoices() {
    console.log('🧾 Seeding invoices...');
    
    const invoices = [
      {
        billTo: {
          fleetId: this.seededData.fleets[0]._id || this.seededData.fleets[0].id,
          customerId: this.seededData.users[2]._id || this.seededData.users[2].id,
          billingAddress: {
            companyName: "Roll & Charge Main Fleet",
            contactName: "John Driver",
            street: "123 Electric Avenue",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
            country: "US",
            email: "john.driver@rollcharge.com",
            phone: "+15550102"
          }
        },
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: 'paid',
        lineItems: [
          {
            type: 'service',
            description: 'Emergency Brake Service',
            serviceRequestId: this.seededData.serviceRequests[2]._id || this.seededData.serviceRequests[2].id,
            quantity: 1,
            unitPrice: 200.00,
            subtotal: 200.00,
            taxable: true,
            taxRate: 8.5,
            taxAmount: 17.00,
            total: 217.00
          },
          {
            type: 'parts',
            description: 'Brake Pads & Fluid',
            serviceRequestId: this.seededData.serviceRequests[2]._id || this.seededData.serviceRequests[2].id,
            quantity: 1,
            unitPrice: 165.00,
            subtotal: 165.00,
            taxable: true,
            taxRate: 8.5,
            taxAmount: 14.03,
            total: 179.03
          }
        ],
        summary: {
          subtotal: 365.00,
          totalTax: 31.03,
          totalAmount: 396.03,
          amountPaid: 396.03,
          amountDue: 0
        },
        createdBy: this.seededData.adminUser._id || this.seededData.adminUser.id
      }
    ];

    for (const invoiceData of invoices) {
      let invoice;
      if (isMongoDatabase()) {
        const { Invoice: MongoInvoice } = await import('../schemas/index.js');
        invoice = new MongoInvoice(invoiceData);
        await invoice.save();
      } else {
        const db = getDatabase();
        invoice = db.create('invoices', invoiceData);
      }
      this.seededData.invoices.push(invoice);
    }

    console.log(`✅ Seeded ${invoices.length} invoices`);
  }

  async clearDatabase() {
    try {
      console.log('🗑️ Clearing database...');
      
      if (isMongoDatabase()) {
        // Clear MongoDB collections
        await Promise.all([
          MongoUser.deleteMany({}),
          MongoFleet.deleteMany({}),
          MongoVehicle.deleteMany({}),
          MongoServiceRequest.deleteMany({}),
          MongoTechnician.deleteMany({}),
          MongoService.deleteMany({}),
          MongoInvoice.deleteMany({})
        ]);
      } else {
        // Clear in-memory database
        const db = getDatabase();
        db.reset();
      }
      
      console.log('✅ Database cleared successfully');
      return { success: true, message: 'Database cleared' };
    } catch (error) {
      console.error('❌ Failed to clear database:', error);
      throw error;
    }
  }
}

// Export default instance
export default new DatabaseSeeder();