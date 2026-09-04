import { useDoctors } from "../../hooks/useDoctors";
import { specialtyByKey } from "../../data/specialties";
import SpecialtyTag from "../ui/SpecialtyTag";
import { SkeletonRows } from "../ui/Skeleton";

export default function ServicesSection() {
  const { data: doctors, loading } = useDoctors();
  const rows = Array.isArray(doctors) ? doctors : [];

  return (
    <section id="services" className="landing-section">
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px" }}>الخدمات والأسعار</h2>
        <p style={{ color: "var(--ink-faint)", fontSize: 13.5, margin: 0 }}>قائمة أسعار موحدة وشفافة لكل الخدمات</p>
      </div>
      <div className="card table-scroll" style={{ padding: 0 }}>
        {loading ? <SkeletonRows rows={3} cols={3} /> : (
          <table style={{ minWidth: 460 }}>
            <thead><tr><th>الدكتور</th><th>التخصص</th><th>سعر الكشف</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "var(--ink-faint)", padding: 20 }}>
                    لا يوجد دكاترة متاحون حاليا.
                  </td>
                </tr>
              ) : rows.map(doctor => {
                const spec = specialtyByKey(doctor.specialtyKey);
                return (
                  <tr key={doctor.id}>
                    <td style={{ fontWeight: 700 }}>{doctor.name}</td>
                    <td><SpecialtyTag specialtyKey={doctor.specialtyKey} name={spec?.name} /></td>
                    <td className="mono">{doctor.price} ج.م</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
