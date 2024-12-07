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

const createStudentIntoDB = async (password: string, payload: TStudent) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string);

  //set student role
  userData.role = 'student';

  // find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    if (admissionSemester) {
      userData.id = await generateStudentId(admissionSemester);
    } else {
      throw new AppError(StatusCodes.NOT_FOUND, 'Academic Semester not found');
    }

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session }); //now new user is an array

    if (!newUser.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    //create a student (transaction-2)
    if (newUser.length) {
      payload.id = newUser[0].id; // set id , _id as user
      payload.user = newUser[0]._id; //reference _id

      const newStudent = await Student.create([payload], { session });
      if (!newStudent.length) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create student');
      }

      await session.commitTransaction();
      session.endSession();

      return newStudent;
    }
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
  }
};

export const UserServices = {
  createStudentIntoDB,
};
