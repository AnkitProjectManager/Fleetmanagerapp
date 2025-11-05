import db from '../database/index.js';

export class User {
  static async findAll(filter = {}) {
    return db.findAll('users', filter);
  }

  static async findById(id) {
    return db.findById('users', id);
  }

  static async findByEmail(email) {
    const users = db.findByField('users', 'email', email);
    return users.length > 0 ? users[0] : null;
  }

  static async create(userData) {
    return db.create('users', userData);
  }

  static async update(id, userData) {
    return db.update('users', id, userData);
  }

  static async delete(id) {
    return db.delete('users', id);
  }

  static async findByFleetId(fleetId) {
    return db.findByField('users', 'fleetId', fleetId);
  }
}

export class Fleet {
  static async findAll(filter = {}) {
    return db.findAll('fleets', filter);
  }

  static async findById(id) {
    return db.findById('fleets', id);
  }

  static async create(fleetData) {
    return db.create('fleets', fleetData);
  }

  static async update(id, fleetData) {
    return db.update('fleets', id, fleetData);
  }

  static async delete(id) {
    return db.delete('fleets', id);
  }
}

export class Vehicle {
  static async findAll(filter = {}) {
    return db.findAll('vehicles', filter);
  }

  static async findById(id) {
    return db.findById('vehicles', id);
  }

  static async create(vehicleData) {
    return db.create('vehicles', vehicleData);
  }

  static async update(id, vehicleData) {
    return db.update('vehicles', id, vehicleData);
  }

  static async delete(id) {
    return db.delete('vehicles', id);
  }

  static async findByFleetId(fleetId) {
    return db.findByField('vehicles', 'fleetId', fleetId);
  }

  static async findByVin(vin) {
    const vehicles = db.findByField('vehicles', 'vin', vin);
    return vehicles.length > 0 ? vehicles[0] : null;
  }
}

export class ServiceRequest {
  static async findAll(filter = {}) {
    return db.findAll('serviceRequests', filter);
  }

  static async findById(id) {
    return db.findById('serviceRequests', id);
  }

  static async create(requestData) {
    return db.create('serviceRequests', requestData);
  }

  static async update(id, requestData) {
    return db.update('serviceRequests', id, requestData);
  }

  static async delete(id) {
    return db.delete('serviceRequests', id);
  }

  static async findByFleetId(fleetId) {
    return db.findByField('serviceRequests', 'fleetId', fleetId);
  }

  static async findByVehicleId(vehicleId) {
    return db.findByField('serviceRequests', 'vehicleId', vehicleId);
  }

  static async findByTechnicianId(technicianId) {
    return db.findByField('serviceRequests', 'technicianId', technicianId);
  }
}

export class Technician {
  static async findAll(filter = {}) {
    return db.findAll('technicians', filter);
  }

  static async findById(id) {
    return db.findById('technicians', id);
  }

  static async create(technicianData) {
    return db.create('technicians', technicianData);
  }

  static async update(id, technicianData) {
    return db.update('technicians', id, technicianData);
  }

  static async delete(id) {
    return db.delete('technicians', id);
  }

  static async findAvailable() {
    return db.findByField('technicians', 'status', 'available');
  }

  static async findByEmail(email) {
    const technicians = db.findByField('technicians', 'email', email);
    return technicians.length > 0 ? technicians[0] : null;
  }
}

export class Service {
  static async findAll(filter = {}) {
    return db.findAll('services', filter);
  }

  static async findById(id) {
    return db.findById('services', id);
  }

  static async create(serviceData) {
    return db.create('services', serviceData);
  }

  static async update(id, serviceData) {
    return db.update('services', id, serviceData);
  }

  static async delete(id) {
    return db.delete('services', id);
  }

  static async findByCategory(category) {
    return db.findByField('services', 'category', category);
  }
}

export class Invoice {
  static async findAll(filter = {}) {
    return db.findAll('invoices', filter);
  }

  static async findById(id) {
    return db.findById('invoices', id);
  }

  static async create(invoiceData) {
    return db.create('invoices', invoiceData);
  }

  static async update(id, invoiceData) {
    return db.update('invoices', id, invoiceData);
  }

  static async delete(id) {
    return db.delete('invoices', id);
  }

  static async findByFleetId(fleetId) {
    return db.findByField('invoices', 'fleetId', fleetId);
  }
}

export default {
  User,
  Fleet,
  Vehicle,
  ServiceRequest,
  Technician,
  Service,
  Invoice
};