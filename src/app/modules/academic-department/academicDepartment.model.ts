import { model, Schema } from 'mongoose';
import { TAcademicDepartment } from './academicDepartment.interface';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

const academicDepartmentSchema = new Schema<TAcademicDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'AcademicFaculty',
    },
  },
  {
    timestamps: true,
  },
);

academicDepartmentSchema.pre('save', async function (next) {
  const isAcademicDepartmentExist = await AcademicDepartment.findOne({
    name: this.name,
  });

  if (isAcademicDepartmentExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'This department is already exist.',
    );
  }

  next();
});

academicDepartmentSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();

  const isAcademicDepartmentExist = await AcademicDepartment.findOne(query);

  if (!isAcademicDepartmentExist) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'This department does not exist.',
    );
  }

  next();
});

export const AcademicDepartment = model<TAcademicDepartment>(
  'AcademicDepartment',
  academicDepartmentSchema,
);
