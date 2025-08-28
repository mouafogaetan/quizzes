import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../features/auth/components/AuthLayout/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import ErrorPage from "../components/ErrorPage";
import ProtectedRoute from "../features/app/components/ProtectedRoute";
import AppLayout from "../features/app/components/AppLayout/AppLayout";
import DashboardPage from "../features/app/pages/DashboardPage";
import ClassesPage from "../features/app/pages/ClassesPage";
import MatieresPage from "../features/app/pages/MatieresPage";
import ModulesPage from "../features/app/pages/ModulesPage";
import ChapitresPage from "../features/app/pages/ChapitresPage";
import LessonsPage from "../features/app/pages/LessonsPage";
import LessonCoursPage from "../features/app/pages/LessonCoursPage";
import LessonQuestionsPage from "../features/app/pages/LessonQuestionsPage";
import LessonExercicesPage from "../features/app/pages/LessonExercicesPage";
import LessonViewPage from "../features/app/pages/LessonViewPage";
import LessonExercicesVideoPage from "../features/app/pages/LessonExercicesVideoPage";
import AdminProtectedRoute from "../features/app/components/AdminProtectedRoute";
import SujetsPage from "../features/app/pages/SujetsPage"; // Import de la nouvelle page

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "",
            element: <ClassesPage />,
          },
          {
            path: "classes",
            children: [
              {
                path: "",
                element: <ClassesPage />,
              },
              {
                path: ":classeId",
                children: [
                  {
                    path: "",
                    element: <MatieresPage />,
                  },
                  {
                    path: ":matiereId",
                    children: [
                      {
                        path: "",
                        element: <ModulesPage />,
                      },
                      {
                        path: "sujets", // Nouvelle route pour les sujets
                        element: <SujetsPage />,
                      },
                      {
                        path: ":moduleId",
                        children: [
                          {
                            path: "",
                            element: <ChapitresPage />,
                          },
                          {
                            path: ":chapitreId",
                            children: [
                              {
                                path: "",
                                element: <LessonsPage />,
                              },
                              {
                                path: ":lessonId",
                                children: [
                                  {
                                    path: "",
                                    element: <LessonViewPage />,
                                  },
                                  {
                                    path: "cours",
                                    element: <LessonCoursPage />,
                                  },
                                  {
                                    path: "questions",
                                    element: <LessonQuestionsPage />,
                                  },
                                  {
                                    path: "exercices",
                                    element: <LessonExercicesPage />,
                                  },
                                  {
                                    path: "exercices-video",
                                    element: <LessonExercicesVideoPage />,
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;