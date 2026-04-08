import { StationLayout } from '../components/kitchen/StationLayout';
import { TaskStatusFilter } from '../components/kitchen/TaskStatusFilter';
import { TaskList } from '../components/kitchen/TaskList';
import { useStationTasks } from '../hooks/useStationTasks';
import { Station } from '../models/Task';

export function BarView() {
  const {
    tasks,
    selectedStatus,
    setSelectedStatus,
    loading,
    error,
    startingTaskId,
    startTaskPreparation,
    taskCounts
  } = useStationTasks(Station.BAR);

  return (
    <StationLayout
      stationName="Estación Barra"
      stationCode="BAR • Bebidas y Cócteles"
      icon="local_bar"
    >
      {}
      <TaskStatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        taskCounts={taskCounts}
      />

      {}
      <div className="flex-1 overflow-y-auto p-10 order-scroll">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">error</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-primary animate-pulse mb-4">refresh</span>
              <p className="text-silver-text">Cargando tareas...</p>
            </div>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onStartPreparation={startTaskPreparation}
            startingTaskId={startingTaskId}
            emptyMessage={selectedStatus === 'ALL' ? 'Sin Tareas Pendientes' : `Sin tareas ${selectedStatus.toLowerCase()}`}
          />
        )}
      </div>
    </StationLayout>
  );
}
