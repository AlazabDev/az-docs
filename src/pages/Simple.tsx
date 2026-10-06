import { AppLayout } from "@/components/layout/AppLayout";

export const Notifications = () => (
  <AppLayout title="الإشعارات"><div className="glass-card rounded-xl p-10 text-center text-muted-foreground">لا توجد إشعارات جديدة.</div></AppLayout>
);

export const Help = () => (
  <AppLayout title="المساعدة">
    <div className="glass-card rounded-xl p-6 space-y-3 text-muted-foreground max-w-3xl">
      <p>• أضف مشروعاً مع رقم هاتف العميل ليتم ربط ملفات واتساب الخاصة به تلقائياً.</p>
      <p>• الملفات الواردة من أرقام غير معروفة تظهر في صفحة الملفات تحت "غير مصنّف" ويمكن ربطها بمشروع.</p>
      <p>• رابط ربط واتساب موجود في صفحة الإعدادات.</p>
    </div>
  </AppLayout>
);
