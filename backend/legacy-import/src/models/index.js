// Unified Database Models - Works with both MongoDB and In-Memory
import { 
  User as MongoUser, 
  Fleet as MongoFleet, 
  Vehicle as MongoVehicle, 
  ServiceRequest as MongoServiceRequest, 
  Technician as MongoTechnician, 
  Service as MongoService, 
  Invoice as MongoInvoice 
} from '../schemas/index.js';
import { getDatabase, isMongoDatabase } from '../database/index.js';

// Base adapter class for unified database operations
class BaseModel {
  constructor(entityName, MongoModel) {
    this.entityName = entityName;
    this.MongoModel = MongoModel;
  }

  async findAll(filter = {}) {
    if (isMongoDatabase()) {
      return await this.MongoModel.find(filter).lean();
    } else {
      const db = getDatabase();
      return db.findAll(this.entityName, filter);
    }
  }

  async findById(id) {
    if (isMongoDatabase()) {
      return await this.MongoModel.findById(id).lean();
    } else {
      const db = getDatabase();
      return db.findById(this.entityName, id);
    }
  }

  async create(data) {
    if (isMongoDatabase()) {
      const document = new this.MongoModel(data);
      return await document.save();
    } else {
      const db = getDatabase();
      return db.create(this.entityName, data);
    }
  }

  async update(id, data) {
    if (isMongoDatabase()) {
      return await this.MongoModel.findByIdAndUpdate(id, data, { new: true }).lean();
    } else {
      const db = getDatabase();
      return db.update(this.entityName, id, data);
    }
  }

  async delete(id) {
    if (isMongoDatabase()) {
      const result = await this.MongoModel.findByIdAndDelete(id);
      return !!result;
    } else {
      const db = getDatabase();
      return db.delete(this.entityName, id);
    }
  }

  async findByField(field, value) {
    if (isMongoDatabase()) {
      return await this.MongoModel.find({ [field]: value }).lean();
    } else {
      const db = getDatabase();
      return db.findByField(this.entityName, field, value);
    }
  }
}

// User Model
class User extends BaseModel {
  constructor() {
    super('users', MongoUser);
  }

  async findByEmail(email) {
    if (isMongoDatabase()) {
      return await MongoUser.findByEmail(email);
    } else {
      const users = await this.findByField('email', email);
      return users.length > 0 ? users[0] : null;
    }
  }

  async findByFleetId(fleetId) {
    return await this.findByField('fleetId', fleetId);
  }
}

// Fleet Model
class Fleet extends BaseModel {
  constructor() {
    super('fleets', MongoFleet);
  }

  async findByOwner(ownerId) {
    return await this.findByField('ownerId', ownerId);
  }

  async findActive() {
    return await this.findByField('status', 'active');
  }
}

// Vehicle Model
class Vehicle extends BaseModel {
  constructor() {
    super('vehicles', MongoVehicle);
  }

  async findByVin(vin) {
    if (isMongoDatabase()) {
      return await MongoVehicle.findByVin(vin);
    } else {
      const vehicles = await this.findByField('vin', vin.toUpperCase());
      return vehicles.length > 0 ? vehicles[0] : null;
    }
  }

  async findByFleetId(fleetId) {
    return await this.findByField('fleetId', fleetId);
  }

  async findByLicensePlate(licensePlate) {
    if (isMongoDatabase()) {
      return await MongoVehicle.findByLicensePlate(licensePlate);
    } else {
      const vehicles = await this.findByField('licensePlate', licensePlate.toUpperCase());
      return vehicles.length > 0 ? vehicles[0] : null;
    }
  }

  async findNeedingMaintenance() {
    if (isMongoDatabase()) {
      return await MongoVehicle.findNeedingMaintenance();
    } else {
      // Simple implementation for in-memory database
      const allVehicles = await this.findAll();
      const now = new Date();
      return allVehicles.filter(vehicle => {
        return vehicle.nextServiceDue && new Date(vehicle.nextServiceDue) < now;
      });
    }
  }

  async findLowBattery(threshold = 20) {
    if (isMongoDatabase()) {
      return await MongoVehicle.findLowBattery(threshold);
    } else {
      const allVehicles = await this.findAll({ status: 'active' });
      return allVehicles.filter(vehicle => 
        vehicle.currentBatteryLevel && vehicle.currentBatteryLevel <= threshold
      );
    }
  }
}

// ServiceRequest Model
class ServiceRequest extends BaseModel {
  constructor() {
    super('serviceRequests', MongoServiceRequest);
  }

  async findByRequestNumber(requestNumber) {
    if (isMongoDatabase()) {
      return await MongoServiceRequest.findByRequestNumber(requestNumber);
    } else {
      const requests = await this.findByField('requestNumber', requestNumber);
      return requests.length > 0 ? requests[0] : null;
    }
  }

  async findByStatus(status) {
    return await this.findByField('status', status);
  }

  async findByFleetId(fleetId) {
    return await this.findByField('fleetId', fleetId);
  }

  async findByVehicleId(vehicleId) {
    return await this.findByField('vehicleId', vehicleId);
  }

  async findByTechnicianId(technicianId) {
    return await this.findByField('assignedTechnician', technicianId);
  }

  async findOverdue() {
    if (isMongoDatabase()) {
      return await MongoServiceRequest.findOverdue();
    } else {
      const allRequests = await this.findAll();
      const now = new Date();
      return allRequests.filter(request => 
        request.scheduledDate && 
        new Date(request.scheduledDate) < now && 
        !['completed', 'cancelled'].includes(request.status)
      );
    }
  }
}

// Technician Model
class Technician extends BaseModel {
  constructor() {
    super('technicians', MongoTechnician);
  }

  async findByEmployeeId(employeeId) {
    if (isMongoDatabase()) {
      return await MongoTechnician.findByEmployeeId(employeeId);
    } else {
      const technicians = await this.findByField('employeeId', employeeId.toUpperCase());
      return technicians.length > 0 ? technicians[0] : null;
    }
  }

  async findAvailable() {
    if (isMongoDatabase()) {
      return await MongoTechnician.findAvailable();
    } else {
      return await this.findByField('status', 'available');
    }
  }

  async findBySpecialization(specialization) {
    if (isMongoDatabase()) {
      return await MongoTechnician.findBySpecialization(specialization);
    } else {
      const allTechnicians = await this.findAll({ employmentStatus: 'active' });
      return allTechnicians.filter(tech => 
        tech.specializations && tech.specializations.includes(specialization)
      );
    }
  }
}

// Service Model
class Service extends BaseModel {
  constructor() {
    super('services', MongoService);
  }

  async findByCategory(category) {
    return await this.findByField('category', category);
  }

  async findByType(serviceType) {
    return await this.findByField('serviceType', serviceType);
  }

  async searchServices(searchTerm) {
    if (isMongoDatabase()) {
      return await MongoService.searchServices(searchTerm);
    } else {
      const allServices = await this.findAll({ status: 'active' });
      return allServices.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  async findByPriceRange(minPrice, maxPrice) {
    if (isMongoDatabase()) {
      return await MongoService.findByPriceRange(minPrice, maxPrice);
    } else {
      const allServices = await this.findAll({ status: 'active' });
      return allServices.filter(service => 
        service.pricing && 
        service.pricing.basePrice >= minPrice && 
        service.pricing.basePrice <= maxPrice
      );
    }
  }
}

// Invoice Model
class Invoice extends BaseModel {
  constructor() {
    super('invoices', MongoInvoice);
  }

  async findByInvoiceNumber(invoiceNumber) {
    if (isMongoDatabase()) {
      return await MongoInvoice.findByInvoiceNumber(invoiceNumber);
    } else {
      const invoices = await this.findByField('invoiceNumber', invoiceNumber);
      return invoices.length > 0 ? invoices[0] : null;
    }
  }

  async findOverdue() {
    if (isMongoDatabase()) {
      return await MongoInvoice.findOverdue();
    } else {
      const allInvoices = await this.findAll();
      const now = new Date();
      return allInvoices.filter(invoice => 
        invoice.dueDate && 
        new Date(invoice.dueDate) < now && 
        invoice.summary && 
        invoice.summary.amountDue > 0 && 
        !['paid', 'cancelled', 'refunded'].includes(invoice.status)
      );
    }
  }

  async findByFleet(fleetId) {
    if (isMongoDatabase()) {
      return await MongoInvoice.findByFleet(fleetId);
    } else {
      return await this.findByField('fleetId', fleetId);
    }
  }

  async findByCustomer(customerId) {
    if (isMongoDatabase()) {
      return await MongoInvoice.findByCustomer(customerId);
    } else {
      return await this.findByField('customerId', customerId);
    }
  }
}

// Create instances
const user = new User();
const fleet = new Fleet();
const vehicle = new Vehicle();
const serviceRequest = new ServiceRequest();
const technician = new Technician();
const service = new Service();
const invoice = new Invoice();

// Export instances
export {
  user as User,
  fleet as Fleet,
  vehicle as Vehicle,
  serviceRequest as ServiceRequest,
  technician as Technician,
  service as Service,
  invoice as Invoice
};

// Default export
export default {
  User: user,
  Fleet: fleet,
  Vehicle: vehicle,
  ServiceRequest: serviceRequest,
  Technician: technician,
  Service: service,
  Invoice: invoice
};