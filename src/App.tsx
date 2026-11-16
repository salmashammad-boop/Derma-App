// @ts-nocheck
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import "./styles.css";

// مفاتيح الربط بقاعدة بياناتك
const firebaseConfig = {
  apiKey: "AIzaSyDjUbMEyD6Z3TbWpIHUIO_21WnpyGe6FyA",
  authDomain: "derma-distribution.firebaseapp.com",
  projectId: "derma-distribution",
  storageBucket: "derma-distribution.firebasestorage.app",
  messagingSenderId: "494532667891",
  appId: "1:494532667891:web:2ea69cb96e3fa9c5d1ca86",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CITIES = [
  "بورتسودان", "كسلا", "القضارف", "حلفا الجديدة",
  "دنقلا", "عطبره", "الدامر", "شندي", "الابيض",
  "كوستي", "المستشفى التركي - الخرطوم", 
  "مستشفى الشهيد علي عبدالفتاح - الخرطوم", 
  "مستشفى البان جديد - الخرطوم"
];

// بيانات دخول الأدمن
const ADMIN_USERNAME = "mahdishamad";
const ADMIN_PASSWORD = "Dermatology@2001";

// رابط البانر
const BANNER_URL = "/banner.jpg";

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+249");
  const [examDate, setExamDate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [cityCounts, setCityCounts] = useState({});
  const [registrationsList, setRegistrationsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "registrations"),
      (snapshot) => {
        const counts = {};
        const list = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          counts[data.city] = (counts[data.city] || 0) + 1;
          list.push({ id: doc.id, ...data });
        });
        setCityCounts(counts);
        list.sort((a, b) => a.city.localeCompare(b.city));
        setRegistrationsList(list);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !examDate || !selectedCity || !email || !phone) {
      setMessage("الرجاء تعبئة جميع الحقول المطلوبة.");
      return;
    }
    if (phone.length < 12) {
      setMessage("الرجاء إدخال رقم جوال صحيح وكامل.");
      return;
    }
    if (examDate > today) {
      setMessage("لا يمكن اختيار تاريخ مستقبلي.");
      return;
    }
    if (cityCounts[selectedCity] >= 5) {
      setMessage("عذراً، اكتمل العدد في هذه المدينة.");
      return;
    }

    // التحقق الآمن من عدم تكرار البريد الإلكتروني (يتجاوز الطلبات القديمة التي لا تحتوي على إيميل)
    const isEmailExists = registrationsList.some(
      (reg) => reg.email && reg.email.toLowerCase() === email.toLowerCase()
    );

    if (isEmailExists) {
      setMessage("عذراً، هذا البريد الإلكتروني مسجل مسبقاً.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await addDoc(collection(db, "registrations"), {
        name,
        email,
        phone,
        examDate,
        city: selectedCity,
        timestamp: serverTimestamp(),
      });
      setMessage("تم التسجيل بنجاح!");
      setName("");
      setEmail("");
      setPhone("+249");
      setExamDate("");
      setSelectedCity("");
    } catch (error) {
      setMessage("حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى.");
    }
    setIsSubmitting(false);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (
      loginUser.toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
      loginPass === ADMIN_PASSWORD
    ) {
      setShowAdminLogin(false);
      setShowReport(true);
      setLoginError("");
      setLoginUser("");
      setLoginPass("");
    } else {
      setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  const printStyles = `
    @media print {
      body { background-color: white !important; }
      .no-print { display: none !important; }
      .print-container { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border: 1px solid #000; padding: 6px; text-align: right; }
      th { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
    }
  `;

  // 1. شاشة التقرير
  if (showReport) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5dc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "system-ui, sans-serif",
          direction: "rtl",
        }}
      >
        <style>{printStyles}</style>
        <div
          className="print-container"
          style={{
            maxWidth: "1000px",
            width: "100%",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            border: "2px solid #d4af37",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={BANNER_URL}
            alt="Banner"
            style={{
              width: "100%",
              maxHeight: "250px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          />

          <div
            className="no-print"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => setShowReport(false)}
              style={{
                padding: "10px 15px",
                backgroundColor: "#000080",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              → تسجيل الخروج والعودة
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: "10px 15px",
                backgroundColor: "#d4af37",
                color: "#000080",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🖨️ طباعة التقرير
            </button>
          </div>

          <h1
            style={{
              color: "#000080",
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            تقرير توزيع نواب الجلدية الدفعة 50 ({registrationsList.length} نواب)
          </h1>

          {registrationsList.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              لا يوجد نواب مسجلين حتى الآن.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "800px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#e6e6fa", color: "#000080" }}>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        textAlign: "right",
                      }}
                    >
                      م
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        textAlign: "right",
                      }}
                    >
                      الاسم الرباعي
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        textAlign: "right",
                      }}
                    >
                      رقم الهاتف
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        textAlign: "right",
                      }}
                    >
                      البريد الإلكتروني
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        textAlign: "right",
                      }}
                    >
                      تاريخ الامتحان
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        textAlign: "right",
                      }}
                    >
                      المدينة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsList.map((reg, index) => (
                    <tr key={reg.id}>
                      <td style={{ border: "1px solid #ccc", padding: "12px" }}>
                        {index + 1}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {reg.name}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "12px",
                          direction: "ltr",
                          textAlign: "right",
                        }}
                      >
                        {reg.phone}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "12px",
                          direction: "ltr",
                          textAlign: "right",
                        }}
                      >
                        {reg.email || "غير مسجل"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "12px",
                          direction: "ltr",
                          textAlign: "right",
                        }}
                      >
                        {reg.examDate}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "12px",
                          color: "#000080",
                          fontWeight: "bold",
                        }}
                      >
                        {reg.city}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. شاشة تسجيل دخول الإدارة
  if (showAdminLogin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5dc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "system-ui, sans-serif",
          direction: "rtl",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            border: "2px solid #d4af37",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={BANNER_URL}
            alt="Banner"
            style={{
              width: "100%",
              maxHeight: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          />
          <h2
            style={{
              color: "#000080",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            تسجيل دخول الإدارة
          </h2>
          <form
            onSubmit={handleAdminLogin}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                اسم المستخدم:
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  direction: "ltr",
                }}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                كلمة المرور:
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  direction: "ltr",
                }}
                required
              />
            </div>
            {loginError && (
              <p style={{ color: "red", textAlign: "center", margin: "0" }}>
                {loginError}
              </p>
            )}
            <button
              type="submit"
              style={{
                backgroundColor: "#000080",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              دخول
            </button>
            <button
              type="button"
              onClick={() => setShowAdminLogin(false)}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              إلغاء
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. شاشة التسجيل الرئيسية
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5dc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
        direction: "rtl",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          border: "2px solid #d4af37",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={BANNER_URL}
          alt="Banner"
          style={{
            width: "100%",
            maxHeight: "200px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={() => setShowAdminLogin(true)}
            style={{
              backgroundColor: "#f3f4f6",
              color: "#000080",
              border: "1px solid #ccc",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            title="دخول الإدارة"
          >
            التقرير 📊
          </button>
        </div>

        <h1
          style={{
            color: "#000080",
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          توزيع نواب أخصائيي الجلدية الدفعة 50
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          الحد الأقصى لكل مدينة هو 5 نواب فقط
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "#000080",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              1. الاسم الرباعي
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "250px" }}>
              <label
                style={{
                  display: "block",
                  color: "#000080",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                2. البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  direction: "ltr",
                }}
              />
            </div>

            <div style={{ flex: "1", minWidth: "250px" }}>
              <label
                style={{
                  display: "block",
                  color: "#000080",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                3. رقم الجوال
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "left",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#000080', fontWeight: 'bold',
                marginBottom: '8px' }}>4. تاريخ امتحان الجزء الأول</label>
            <input type="date" max={today} value={examDate} onChange={(e) => setExamDate(e.target.value)} placeholder="اختر التاريخ" style={{ width: '100%', padding: '12px',
                border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', direction: 'rtl', textAlign: 'right', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "#000080",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              5. الرغبة في التوزيع (المدن المتاحة)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "10px",
              }}
            >
              {CITIES.map((city) => {
                const count = cityCounts[city] || 0;
                const isFull = count >= 5;
                const isSelected = selectedCity === city;

                return (
                  <div
                    key={city}
                    onClick={() => !isFull && setSelectedCity(city)}
                    style={{
                      padding: "15px",
                      border: `2px solid ${
                        isSelected ? "#e6e6fa" : isFull ? "#eee" : "#e5e7eb"
                      }`,
                      borderRadius: "8px",
                      backgroundColor: isFull
                        ? "#f9fafb"
                        : isSelected
                        ? "#e6e6fa"
                        : "white",
                      cursor: isFull ? "not-allowed" : "pointer",
                      opacity: isFull ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          color: isFull ? "#9ca3af" : "#000080",
                        }}
                      >
                        {city}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: isFull ? "#ef4444" : "#10b981",
                        }}
                      >
                        {count}/5
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#e5e7eb",
                        height: "6px",
                        borderRadius: "3px",
                      }}
                    >
                      <div
                        style={{
                          width: `${(count / 5) * 100}%`,
                          backgroundColor: isFull ? "#ef4444" : "#d4af37",
                          height: "100%",
                          borderRadius: "3px",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {message && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: message.includes("بنجاح")
                  ? "#d1fae5"
                  : "#fce7f3",
                color: message.includes("بنجاح") ? "#065f46" : "#be185d",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: "#ff00ff",
              color: "white",
              padding: "15px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: "10px",
            }}
          >
            {isSubmitting ? "جاري التسجيل..." : "تأكيد التسجيل"}
          </button>
        </form>
      </div>
    </div>
  );
}
