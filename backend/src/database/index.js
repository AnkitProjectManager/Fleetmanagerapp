// In-memory database implementation
// This can be easily replaced with MongoDB/PostgreSQL later

class InMemoryDatabase {
  constructor() {
    this.data = {
      users: [],
      fleets: [],
      vehicles: [],
      serviceRequests: [],
      technicians: [],
      services: [],
      invoices: [],
      administrators: []
    };
    this.counters = {
      users: 0,
      fleets: 0,
      vehicles: 0,
      serviceRequests: 0,
      technicians: 0,
      services: 0,
      invoices: 0,
      administrators: 0
    };
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  generateId(entity) {
    return ++this.counters[entity];
  }

  // Generic CRUD operations
  create(entity, data) {
    const id = this.generateId(entity);
    const record = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data[entity].push(record);
    return record;
  }

  findAll(entity, filter = {}) {
    let records = [...this.data[entity]];
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null) {
        records = records.filter(record => {
          if (typeof filter[key] === 'string') {
            return record[key]?.toString().toLowerCase().includes(filter[key].toLowerCase());
          }
          return record[key] === filter[key];
        });
      }
    });
    
    return records;
  }

  findById(entity, id) {
    return this.data[entity].find(record => record.id === parseInt(id));
  }

  findByField(entity, field, value) {
    return this.data[entity].filter(record => record[field] === value);
  }

  update(entity, id, data) {
    const index = this.data[entity].findIndex(record => record.id === parseInt(id));
    if (index === -1) return null;
    
    this.data[entity][index] = {
      ...this.data[entity][index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.data[entity][index];
  }

  delete(entity, id) {
    const index = this.data[entity].findIndex(record => record.id === parseInt(id));
    if (index === -1) return false;
    
    this.data[entity].splice(index, 1);
    return true;
  }

  // Initialize with sample data
  initializeSampleData() {
    // Sample Fleet
    const sampleFleet = {
      name: "Roll & Charge Main Fleet",
      description: "Primary electric vehicle fleet",
      location: "San Francisco, CA",
      contactEmail: "fleet@rollcharge.com",
      contactPhone: "+1-555-0123",
      status: "active"
    };
    const fleet = this.create('fleets', sampleFleet);

    // Sample Admin User
    const adminUser = {
      email: "admin@rollcharge.com",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewjyxVphe4K1aJ5C", // "admin123"
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      fleetId: fleet.id,
      status: "active",
      phone: "+1-555-0100",
      avatar: null
    };
    this.create('users', adminUser);

    // Sample Fleet Manager
    const managerUser = {
      email: "manager@rollcharge.com",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewjyxVphe4K1aJ5C", // "manager123"
      firstName: "Fleet",
      lastName: "Manager",
      role: "fleet_manager",
      fleetId: fleet.id,
      status: "active",
      phone: "+1-555-0101",
      avatar: null
    };
    this.create('users', managerUser);

    // Sample Vehicles
    const vehicles = [
      {
        fleetId: fleet.id,
        vin: "1HGCM82633A123456",
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        licensePlate: "EV-001",
        batteryCapacity: 75,
        currentBatteryLevel: 85,
        mileage: 15000,
        status: "active",
        lastServiceDate: "2024-01-15",
        nextServiceDue: "2024-04-15",
        location: "Downtown Charging Station"
      },
      {
        fleetId: fleet.id,
        vin: "1HGCM82633A789012",
        make: "Nissan",
        model: "Leaf",
        year: 2022,
        licensePlate: "EV-002",
        batteryCapacity: 62,
        currentBatteryLevel: 92,
        mileage: 28000,
        status: "active",
        lastServiceDate: "2024-02-01",
        nextServiceDue: "2024-05-01",
        location: "Main Depot"
      },
      {
        fleetId: fleet.id,
        vin: "1HGCM82633A345678",
        make: "BMW",
        model: "iX3",
        year: 2023,
        licensePlate: "EV-003",
        batteryCapacity: 80,
        currentBatteryLevel: 45,
        mileage: 8500,
        status: "in_service",
        lastServiceDate: "2024-01-10",
        nextServiceDue: "2024-04-10",
        location: "Service Center A"
      }
    ];
    
    vehicles.forEach(vehicle => this.create('vehicles', vehicle));

    // Sample Technicians
    const technicians = [
      {
        name: "John Smith",
        email: "john.smith@rollcharge.com",
        phone: "+1-555-0201",
        specializations: ["Battery Maintenance", "Charging Systems", "General Repair"],
        certifications: ["EV Certified Technician", "Tesla Service Certified"],
        status: "available",
        location: "Service Center A",
        experience: 5
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@rollcharge.com",
        phone: "+1-555-0202",
        specializations: ["Software Updates", "Diagnostics", "Electrical Systems"],
        certifications: ["BMW i Certified", "Nissan EV Specialist"],
        status: "available",
        location: "Service Center B",
        experience: 7
      },
      {
        name: "Mike Davis",
        email: "mike.davis@rollcharge.com",
        phone: "+1-555-0203",
        specializations: ["Mechanical Repair", "Brake Systems", "Suspension"],
        certifications: ["ASE Certified", "Hybrid/EV Specialist"],
        status: "busy",
        location: "Mobile Unit 1",
        experience: 10
      }
    ];
    
    technicians.forEach(technician => this.create('technicians', technician));

    // Sample Services
    const services = [
      {
        name: "Battery Health Check",
        description: "Comprehensive battery performance and health assessment",
        estimatedDuration: 60,
        price: 89.99,
        category: "maintenance",
        requiredSpecializations: ["Battery Maintenance"]
      },
      {
        name: "Software Update",
        description: "Latest firmware and software updates for vehicle systems",
        estimatedDuration: 45,
        price: 0.00,
        category: "software",
        requiredSpecializations: ["Software Updates", "Diagnostics"]
      },
      {
        name: "Charging Port Inspection",
        description: "Inspection and cleaning of charging port and connections",
        estimatedDuration: 30,
        price: 49.99,
        category: "maintenance",
        requiredSpecializations: ["Charging Systems"]
      },
      {
        name: "Brake System Service",
        description: "Brake pad inspection, rotor check, and brake fluid service",
        estimatedDuration: 90,
        price: 199.99,
        category: "repair",
        requiredSpecializations: ["Brake Systems", "Mechanical Repair"]
      },
      {
        name: "Tire Rotation & Alignment",
        description: "Tire rotation and wheel alignment for optimal performance",
        estimatedDuration: 75,
        price: 129.99,
        category: "maintenance",
        requiredSpecializations: ["General Repair"]
      }
    ];
    
    services.forEach(service => this.create('services', service));

    // Sample Service Requests
    const serviceRequests = [
      {
        fleetId: fleet.id,
        vehicleId: 1,
        requestedServices: [1, 3], // Battery check + charging port
        priority: "normal",
        status: "waiting",
        description: "Routine maintenance check - battery seems to be charging slower",
        requestedBy: managerUser.email,
        preferredDate: "2024-12-10",
        location: "Service Center A",
        technicianId: null,
        assignedTechnicianName: null,
        estimatedCompletionTime: null,
        actualCompletionTime: null,
        completionNotes: null,
        totalCost: 139.98
      },
      {
        fleetId: fleet.id,
        vehicleId: 2,
        requestedServices: [2], // Software update
        priority: "normal",
        status: "in_progress",
        description: "Software update notification received",
        requestedBy: managerUser.email,
        preferredDate: "2024-12-08",
        location: "Service Center B",
        technicianId: 2,
        assignedTechnicianName: "Sarah Johnson",
        estimatedCompletionTime: "2024-12-08T16:00:00Z",
        actualCompletionTime: null,
        completionNotes: null,
        totalCost: 0.00
      },
      {
        fleetId: fleet.id,
        vehicleId: 3,
        requestedServices: [4, 5], // Brake service + tire rotation
        priority: "urgent",
        status: "completed",
        description: "Brake warning light activated - immediate attention required",
        requestedBy: managerUser.email,
        preferredDate: "2024-12-05",
        location: "Service Center A",
        technicianId: 3,
        assignedTechnicianName: "Mike Davis",
        estimatedCompletionTime: "2024-12-05T18:00:00Z",
        actualCompletionTime: "2024-12-05T17:30:00Z",
        completionNotes: "Brake pads replaced, rotors resurfaced. All systems functioning normally.",
        totalCost: 329.98
      }
    ];
    
    serviceRequests.forEach(request => this.create('serviceRequests', request));

    console.log('✅ Sample data initialized successfully');
  }

  // Get database statistics
  getStats() {
    return {
      users: this.data.users.length,
      fleets: this.data.fleets.length,
      vehicles: this.data.vehicles.length,
      serviceRequests: this.data.serviceRequests.length,
      technicians: this.data.technicians.length,
      services: this.data.services.length,
      invoices: this.data.invoices.length,
      administrators: this.data.administrators.length
    };
  }

  // Reset database
  reset() {
    Object.keys(this.data).forEach(key => {
      this.data[key] = [];
      this.counters[key] = 0;
    });
    this.initializeSampleData();
  }
}

// Create and export singleton instance
export const db = new InMemoryDatabase();
export default db;