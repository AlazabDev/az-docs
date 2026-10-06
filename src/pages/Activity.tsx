import { AppLayout } from "@/components/layout/AppLayout";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { useActivities } from "@/hooks/useData";

const Activity = () => {
  const { data: activities = [] } = useActivities(100);
  return (
    <AppLayout title="سجل النشاط" subtitle="كل العمليات التي تمت على النظام">
      <div className="max-w-3xl"><ActivityTimeline activities={activities} /></div>
    </AppLayout>
  );
};

export default Activity;
