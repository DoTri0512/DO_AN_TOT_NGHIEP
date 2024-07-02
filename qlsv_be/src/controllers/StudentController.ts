import { Request, Response } from "express";
import { Departments } from "../entities/Department";
import { AppDataSource } from "../database/db";
import { Majors } from "../entities/Major";
import { Classes } from "../entities/Class";
import { Students } from "../entities/Student";
import { Users } from "../entities/User";
import bcrypt from "bcrypt";
import flash from "connect-flash";
import session from "express-session";
import multer from "multer";
import path from "path";
import moment from "moment";
import { Enrollments } from "../entities/Enrollment";
import { Schedules } from "../entities/Schedule";
import { ExamStudent } from "../entities/ExamStudent";
import { Grades_Subjects } from "../entities/Grades_Subjects";
import { Conduct_Scores } from "../entities/Conduct_Scores";
import { Subjects } from "../entities/Subject";
var storage = multer.diskStorage({
  destination: "./public/image",
  filename: function (req, file, cb) {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
var upload = multer({
  storage: storage,
});
export const getAllStudent = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;
  const [items, count] = await AppDataSource.getRepository(
    Students
  ).findAndCount({
    relations: ["department", "major", "classes"],
    skip: offset,
    take: limit,
  });
  const totalPages = Math.ceil(count / limit);
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/student/student_list", {
      list: items,
      user_name,
      messages: req.flash(),
      currentPage: page,
      totalPages,
    });
  }
};

export const getStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  // const course = await AppDataSource.getRepository(Courses).find();
  const department = await AppDataSource.getRepository(Departments).find();
  const major = await AppDataSource.getRepository(Majors).find();
  const classes = await AppDataSource.getRepository(Classes).find();
  const items = await AppDataSource.getRepository(Students)
    .createQueryBuilder("students")
    .leftJoinAndSelect("students.department", "department_id")
    .leftJoinAndSelect("students.major", "major_id")
    .leftJoinAndSelect("students.classes", "class_id")
    .where("students.id = :id", { id: id })
    .getOne();
  const user_name = await (req.session as any).user;
  if (user_name) {
    res.render("admin/student/student_update", {
      item: items,
      user_name,
      messages: req.flash(),
      // list_course: course,
      list_department: department,
      list_major: major,
      list_class: classes,
      moment,
    });
  }
};

export const getDetailStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await AppDataSource.getRepository(Students)
    .createQueryBuilder("students")
    .leftJoinAndSelect("students.department", "department_id")
    .leftJoinAndSelect("students.major", "major_id")
    .leftJoinAndSelect("students.classes", "class_id")
    .where("students.id = :id", { id: id })
    .getOne();
  const user_name = await (req.session as any).user;

  if (user_name) {
    res.render("admin/student/student_detail", {
      item: items,
      user_name,
      moment,
    });
  }
};

export const getAddStudent = async (req: Request, res: Response) => {
  const user_name = (req.session as any).user;
  const department = await AppDataSource.getRepository(Departments).find();
  const major = await AppDataSource.getRepository(Majors).find();
  const classes = await AppDataSource.getRepository(Classes).find();
  if (user_name) {
    res.render("admin/student/student_add", {
      user_name,
      message: null,
      messages: req.flash(),
      list_department: department,
      list_major: major,
      list_class: classes,
    });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const {
    id,
    firstName,
    lastName,
    fullName,
    phoneNumber,
    email,
    citizenID,
    course_id,
    department_id,
    major_id,
    class_id,
    year_of_admission,
    year_of_starting_admission,
    birthDate,
    address,
    country,
    gender,
    nation,
    fullNameFather,
    phoneNumberFather,
    fullNameMother,
    phoneNumberMother,
  } = req.body;
  try {
    const user_name = (req.session as any).user.username;
    const studentRepository = await AppDataSource.getRepository(Students);
    const existingStudentID = await studentRepository
      .createQueryBuilder("students")
      .where("students.id = :id", {
        id: id,
      })
      .getOne();
    if (
      id === "" ||
      firstName === "" ||
      lastName === "" ||
      fullName === "" ||
      phoneNumber === "" ||
      citizenID === "" ||
      email === "" ||
      birthDate === "" ||
      address === "" ||
      country === "" ||
      gender === "" ||
      nation === "" ||
      fullNameFather === "" ||
      phoneNumberFather === "" ||
      fullNameMother === "" ||
      phoneNumberMother === "" ||
      year_of_admission === "" ||
      year_of_starting_admission === ""
    ) {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/admin/student_add");
    } else if (phoneNumber.length < 10) {
      req.flash("error", "Số điện thoại độ dài phải 10 chữ số");
      return res.redirect("/admin/student_add");
    } else if (citizenID.length < 12) {
      req.flash("error", "CCCD độ dài phải 12 chữ số");
      return res.redirect("/admin/student_add");
    } else if (existingStudentID) {
      req.flash("error", "Mã sinh viên đã tồn tại");
      return res.redirect("/admin/student_add");
    } else {
      const addStudent = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Students)
        .values({
          id: id,
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          phoneNumber: phoneNumber,
          email: email,
          citizenID: citizenID,
          // course: course_id,
          department: department_id,
          major: major_id,
          classes: class_id,
          year_of_admission: year_of_admission,
          year_of_starting_admission: year_of_starting_admission,
          birthDate: birthDate,
          address: address,
          country: country,
          gender: gender,
          nation: nation,
          fullNameFather: fullNameFather,
          phoneNumberFather: phoneNumberFather,
          fullNameMother: fullNameMother,
          phoneNumberMother: phoneNumberMother,
          img_student: req.file?.filename,
        })
        .execute();
      if (addStudent) {
        const addUser = await AppDataSource.createQueryBuilder()
          .insert()
          .into(Users)
          .values({
            username: id,
            password: citizenID,
            role: 1,
          });
      }
      req.flash("success", "Thêm thành công");
      return res.redirect("/admin/student_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const {
    msv,
    firstName,
    lastName,
    fullName,
    phoneNumber,
    email,
    citizenID,
    course_id,
    department_id,
    major_id,
    class_id,
    year_of_admission,
    year_of_starting_admission,
    birthDate,
    address,
    country,
    gender,
    nation,
    fullNameFather,
    phoneNumberFather,
    fullNameMother,
    phoneNumberMother,
  } = req.body;
  const { id } = req.params;
  try {
    const user_name = (req.session as any).user.username;
    if (
      firstName === "" ||
      lastName === "" ||
      fullName === "" ||
      phoneNumber === "" ||
      citizenID === "" ||
      email === "" ||
      birthDate === "" ||
      address === "" ||
      country === "" ||
      gender === "" ||
      nation === "" ||
      fullNameFather === "" ||
      phoneNumberFather === "" ||
      fullNameMother === "" ||
      phoneNumberMother === "" ||
      year_of_admission === "" ||
      year_of_starting_admission === ""
    ) {
      req.flash("error", "Yêu cầu nhập đầy đủ thông tin");
      return res.redirect("/getStudent/" + id);
    } else {
      const addStudent = await AppDataSource.createQueryBuilder()
        .update(Students)
        .set({
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          phoneNumber: phoneNumber,
          email: email,
          citizenID: citizenID,
          // course: course_id,
          department: department_id,
          major: major_id,
          classes: class_id,
          year_of_admission: year_of_admission,
          year_of_starting_admission: year_of_starting_admission,
          birthDate: birthDate,
          address: address,
          country: country,
          gender: gender,
          nation: nation,
          fullNameFather: fullNameFather,
          phoneNumberFather: phoneNumberFather,
          fullNameMother: fullNameMother,
          phoneNumberMother: phoneNumberMother,
          img_student: req.file?.filename,
        })
        .where("id = :id", { id: id })
        .execute();
      req.flash("success", "Cập nhật thành công");
      return res.redirect("/admin/student_list");
    }
  } catch (e: any) {
    res.status(500).send(e.message);
  }
};

export const getUserStudent = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  if (user_name) {
    // console.log(user_name.student.fullName);
    return res.render("user/student_home", {
      user_name,
      success: "Đăng nhập thành công",
      messages: req.flash(),
    });
  }
};
export const getStudentInfo = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const items = await AppDataSource.getRepository(Students)
    .createQueryBuilder("students")
    .leftJoinAndSelect("students.department", "department_id")
    .leftJoinAndSelect("students.major", "major_id")
    .leftJoinAndSelect("students.classes", "class_id")
    .where("students.id = :id", { id: user_name.student.id })
    .getOne();

  if (user_name) {
    // console.log(user_name.student.course);
    return res.render("user/student_info", {
      user_name,
      moment,
      item: items,
    });
  }
};

export const getSubjectStudent = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const subject_student = await AppDataSource.getRepository(Enrollments)
    .createQueryBuilder("enrollments")
    .leftJoinAndSelect("enrollments.student", "student_id")
    .leftJoinAndSelect("enrollments.class_course", "classCourse_id")
    .leftJoinAndSelect("classCourse_id.schedule_subject", "schedule_subject")
    .leftJoinAndSelect("classCourse_id.subject", "subject_id")
    .leftJoinAndSelect("classCourse_id.lecturer", "lecturer_id")
    .leftJoinAndSelect("schedule_subject.room", "room")
    .leftJoinAndSelect("schedule_subject.schedule", "schedule")
    .where("enrollments.studentId = :studentId", {
      studentId: user_name.student.id,
    })
    .getMany();
  const schedule = subject_student.map((subject_student) => ({
    classCourse_name: subject_student.class_course.classCourse_name,
    lecturer: subject_student.class_course.lecturer,
    credits: subject_student.class_course.subject.credits,
    day: subject_student.class_course.schedule_subject.map(
      (scheduleSubject) => scheduleSubject.schedule.day
    ),
    room: subject_student.class_course.schedule_subject.map(
      (scheduleSubject) => scheduleSubject.room.room_name
    ),
    start_period: subject_student.class_course.schedule_subject.map(
      (scheduleSubject) => scheduleSubject.schedule.start_period
    ),
    end_period: subject_student.class_course.schedule_subject.map(
      (scheduleSubject) => scheduleSubject.schedule.end_period
    ),
    startTime: subject_student.class_course.schedule_subject.map(
      (scheduleSubject) => scheduleSubject.schedule.startTime
    ),
    endTime: subject_student.class_course.schedule_subject.map(
      (scheduleSubject) => scheduleSubject.schedule.endTime
    ),
  }));
  if (user_name) {
    // console.log(subject_student);
    return res.render("user/student_enrollment", {
      user_name,
      moment,
      list: schedule,
    });
  }
};

export const getExamStudent = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const exam_student = await AppDataSource.getRepository(ExamStudent)
    .createQueryBuilder("exam_student")
    .leftJoinAndSelect("exam_student.student", "student_id")
    .leftJoinAndSelect("exam_student.exam", "exam_id")
    .leftJoinAndSelect("exam_id.subject", "subject_id")
    .leftJoinAndSelect("exam_id.room", "room_id")
    .where("exam_student.student_id = :student_id", {
      student_id: user_name.student.id,
    })
    .getMany();
  if (user_name) {
    return res.render("user/student_exam", {
      user_name,
      moment,
      list: exam_student,
    });
  }
};

export const getGradeStudent = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const exam_student = await AppDataSource.getRepository(Grades_Subjects)
    .createQueryBuilder("grades_subjects")
    .leftJoinAndSelect("grades_subjects.student", "student_id")
    .leftJoinAndSelect("grades_subjects.subject", "subject_id")
    .where("grades_subjects.studentId = :studentId", {
      studentId: user_name?.student.id,
    })
    .getMany();
  //điểm theo hệ số 10
  const grades = exam_student.map((grade) => ({
    subject_id: grade.subject.id,
    subjectName: grade.subject.subject_name,
    grade: grade.exam_score,
    convertGrade: convertGradeExam(grade.exam_score),
    credits: grade.subject.credits,
  }));
  //chuyển đổi điểm từ hệ 10 sang hệ 4
  const convertGrade = exam_student.map((grade) => ({
    subject_id: grade.subject.id,
    subjectName: grade.subject.subject_name,
    grade: convertGradeExam(grade.exam_score),
    credits: grade.subject.credits,
  }));
  const gpa = calculateGPA(grades).toFixed(1);
  const convertGradeExams = calculateGPA(convertGrade).toFixed(1);
  const ratings = grades.map((grade) => {
    let rating: string = "";
    let evaluation: string = "";
    if (grade.grade >= 8.5) {
      rating = "A";
      evaluation = "Đạt";
    } else if (grade.grade >= 7) {
      rating = "B";
      evaluation = "Đạt";
    } else if (grade.grade >= 5.5) {
      rating = "C";
      evaluation = "Đạt";
    } else if (grade.grade >= 4) {
      rating = "D";
      evaluation = "Đạt";
    } else {
      rating = "F";
      evaluation = "Không đạt";
    }
    return { ...grade, rating, evaluation };
  });
  if (user_name) {
    return res.render("user/student_grade", {
      user_name,
      moment,
      list: ratings,
      gpa,
      convertGradeExams,
      // ratings,
    });
  }
};

//Hàm tính điểm trung bình
function calculateGPA(
  grades: { subjectName: string; grade: number; credits: number }[]
): number {
  const totalCredits = grades.reduce((acc, curr) => acc + curr.credits, 0);
  const totalQualityPoints = grades.reduce(
    (acc, curr) => acc + curr.grade * curr.credits,
    0
  );
  if (totalCredits === 0) {
    return 0;
  }
  return totalQualityPoints / totalCredits;
}

function convertGradeExam(grade: number) {
  if (grade >= 8.5) {
    return 4;
  } else if (grade >= 7) {
    return 3;
  } else if (grade >= 5.5) {
    return 2;
  } else if (grade >= 4) {
    return 1;
  } else {
    return 0;
  }
}

export const getConductScoreStudent = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const conduct_score = await AppDataSource.getRepository(Conduct_Scores)
    .createQueryBuilder("conduct_score")
    .leftJoinAndSelect("conduct_score.student", "student_id")
    .where("conduct_score.studentId = :studentId", {
      studentId: user_name.student.id,
    })
    .getOne();
  const grade: number | null = conduct_score?.conduct_score ?? null;
  let rating: string = "";

  if (grade !== null) {
    if (grade >= 9) {
      rating = "Xuất sắc";
    } else if (grade >= 8) {
      rating = "Tốt";
    } else if (grade >= 6) {
      rating = "Khá";
    } else if (grade >= 4) {
      rating = "Trung bình";
    } else {
      rating = "Yếu";
    }
  }
  if (user_name) {
    return res.render("user/student_conduct", {
      user_name,
      moment,
      item: conduct_score,
      grade,
      rating,
    });
  }
};

export const getCommendStudent = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  const conduct_score = await AppDataSource.getRepository(Conduct_Scores)
    .createQueryBuilder("conduct_score")
    .leftJoinAndSelect("conduct_score.student", "student_id")
    .where("conduct_score.studentId = :studentId", {
      studentId: user_name?.student.id,
    })
    .getOne();
  const exam_student = await AppDataSource.getRepository(Grades_Subjects)
    .createQueryBuilder("grades_subjects")
    .leftJoinAndSelect("grades_subjects.student", "student_id")
    .leftJoinAndSelect("grades_subjects.subject", "subject_id")
    .where("grades_subjects.studentId = :studentId", {
      studentId: user_name?.student.id,
    })
    .getMany();
  const grades = exam_student.map((grade) => ({
    subjectName: grade.subject.subject_name,
    grade: convertGradeExam(grade.exam_score),
    credits: grade.subject.credits,
  }));
  const gpa = calculateGPA(grades).toFixed(1);
  let grade: number | null = conduct_score?.conduct_score ?? null;
  const gradeNumber =
    grade !== null ? convertGradeExam(parseFloat(grade.toString())) : 0;
  let arv: number = Math.round(((parseFloat(gpa) + gradeNumber) / 2) * 10) / 10;
  let commend: string = "";
  // const convertGrade = grade !== null ? convertGradeExam(arv) : null;
  if (arv != null) {
    if (arv >= 3.6) {
      commend = "Xuất sắc";
    } else if (arv >= 3) {
      commend = "Giỏi";
    }
  }
  if (user_name) {
    return res.render("user/student_commend", {
      user_name,
      arv,
      commend,
      student: conduct_score,
    });
  }
};

export const getChangePassword = async (req: Request, res: Response) => {
  const user_name = await (req.session as any).user;
  if (user_name) {
    return res.render("user/student_password", {
      user_name,
      messages: req.flash(),
    });
  }
};

export const ChangePassword = async (req: Request, res: Response) => {
  const user = await (req.session as any).user;
  const { currentPassword, newPassword } = req.body;
  const userRepository = await AppDataSource.getRepository(Users);
  const student_user = await userRepository.findOne({ where: { id: user.id } });
  if (!student_user) {
    return res.status(404).send("Student not found");
  }
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    student_user.password
  );
  if (!isPasswordValid) {
    req.flash("error", "Mật khẩu hiện tại không chính xác");
    return res.redirect("/student/change_password");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const changePassword = await AppDataSource.createQueryBuilder()
    .update(Users)
    .set({ password: hashedPassword })
    .where("id = :id", { id: user.id })
    .execute();
  if (changePassword) {
    req.flash("success", "Đổi mật khẩu thành công");
    return res.redirect("/student/home");
  }
};


