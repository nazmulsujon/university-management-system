import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../academic-semester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';
import mongoose from 'mongoose';

const createStudentIntoDB = async (
  password: string = config.default_password as string,
  payload: TStudent,
) => {
  const userData: Partial<TUser> = {
    password,
    role: 'student',
  };

  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  if (!admissionSemester) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Academic Semester not found');
  }

  userData.id = await generateStudentId(admissionSemester);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    payload.id = newUser[0].id;
    payload.user = newUser[0]._id;

    const newStudent = await Student.create([payload], { session });
    if (!newStudent.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create student');
    }

    await session.commitTransaction();

    return newStudent;
  } catch (err) {
    console.log('err >>>', err);
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const UserServices = {
  createStudentIntoDB,
};
