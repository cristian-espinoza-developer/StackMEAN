import { ObjectId, type Collection, type Db, type WithId } from 'mongodb';
import { definedFields, type CreateEmployeeData, type Employee, type UpdateEmployeeData } from '../../domain/employee.js';
import type { IEmployeeRepository } from '../../repositories/IEmployeeRepository.js';

interface EmployeeDocument extends CreateEmployeeData {
  createdAt: Date;
  updatedAt: Date;
}

const OBJECT_ID = /^[0-9a-f]{24}$/i;

const toEmployee = (doc: WithId<EmployeeDocument>): Employee => ({
  id: doc._id.toString(),
  nombre: doc.nombre,
  cargo: doc.cargo,
  departamento: doc.departamento,
  sueldo: doc.sueldo,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

export class MongoEmployeeRepository implements IEmployeeRepository {
  private readonly collection: Collection<EmployeeDocument>;

  constructor(db: Db) {
    this.collection = db.collection<EmployeeDocument>('empleados');
  }

  async findAll(): Promise<Employee[]> {
    const docs = await this.collection.find().toArray();
    return docs.map(toEmployee);
  }

  async create(data: CreateEmployeeData): Promise<Employee> {
    const now = new Date();
    const doc: EmployeeDocument = { ...data, createdAt: now, updatedAt: now };
    const { insertedId } = await this.collection.insertOne(doc);
    return toEmployee({ ...doc, _id: insertedId });
  }

  async update(id: string, data: UpdateEmployeeData): Promise<Employee | null> {
    if (!OBJECT_ID.test(id)) return null;
    const doc = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...definedFields(data), updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return doc ? toEmployee(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!OBJECT_ID.test(id)) return false;
    const { deletedCount } = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return deletedCount === 1;
  }
}
