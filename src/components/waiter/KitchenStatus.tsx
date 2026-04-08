import { useState, useEffect } from 'react';
import type { Task } from '../../models/Task';
import { TaskStatus, Station } from '../../models/Task';
import { orderService } from '../../services/orderService';
import type { OrderStatusResponse } from '../../models/Order';
import { OrderStatus } from '../../models/Order';

interface KitchenStatusProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh: () => void;
}

interface OrderGroup {
  orderId: number;
  tableNumber: string;
  tasks: Task[];
  orderStatus?: OrderStatusResponse;
}

export const KitchenStatus = ({
  tasks,
  isLoading,
  onRefresh,
}: KitchenStatusProps) => {
  const [orderStatuses, setOrderStatuses] = useState<Map<number, OrderStatusResponse>>(new Map());

  const groupTasksByOrder = (): OrderGroup[] => {
    const groups = new Map<number, OrderGroup>();

    tasks.forEach((task) => {
      if (!groups.has(task.orderId)) {
        groups.set(task.orderId, {
          orderId: task.orderId,
          tableNumber: task.tableNumber,
          tasks: [],
          orderStatus: orderStatuses.get(task.orderId),
        });
      }
      groups.get(task.orderId)!.tasks.push(task);
    });

    return Array.from(groups.values()).sort((a, b) => b.orderId - a.orderId);
  };

  useEffect(() => {
    const uniqueOrderIds = [...new Set(tasks.map((t) => t.orderId))];

    const fetchOrderStatuses = async () => {
      const statusMap = new Map<number, OrderStatusResponse>();

      await Promise.all(
        uniqueOrderIds.map(async (orderId) => {
          try {
            const status = await orderService.getOrderStatus(orderId);
            statusMap.set(orderId, status);
          } catch (error) {
            console.error(`Error fetching status for order ${orderId}:`, error);
          }
        })
      );

      setOrderStatuses(statusMap);
    };

    if (uniqueOrderIds.length > 0) {
      fetchOrderStatuses();
    }
  }, [tasks]);

  const calculateProgress = (orderTasks: Task[]): number => {
    const stationsCount = 3; 
    const stations = [Station.BAR, Station.HOT_KITCHEN, Station.COLD_KITCHEN];

    let completedStations = 0;

    stations.forEach((station) => {
      const stationTasks = orderTasks.filter((t) => t.station === station);
      if (stationTasks.length > 0) {
        const allCompleted = stationTasks.every((t) => t.status === TaskStatus.COMPLETED);
        if (allCompleted) {
          completedStations++;
        }
      }
    });

    return (completedStations / stationsCount) * 100;
  };

  const getStatusLabel = (orderStatus?: OrderStatusResponse): { label: string; color: string } => {
    if (!orderStatus) {
      return { label: 'Cargando...', color: 'text-silver-text' };
    }

    switch (orderStatus.status) {
      case OrderStatus.COMPLETED:
        return { label: 'Lista', color: 'text-primary' };
      case OrderStatus.IN_PREPARATION:
        return { label: 'Preparando', color: 'text-primary' };
      case OrderStatus.PENDING:
        return { label: 'En Cola', color: 'text-silver-text' };
      default:
        return { label: orderStatus.status, color: 'text-silver-text' };
    }
  };

  const getContainerStyle = (orderStatus?: OrderStatusResponse): string => {
    if (!orderStatus) {
      return 'bg-white/5 border-white/10';
    }

    switch (orderStatus.status) {
      case OrderStatus.COMPLETED:
        return 'glass-panel-dark border-primary/30';
      case OrderStatus.IN_PREPARATION:
        return 'bg-white/5 border-white/10';
      case OrderStatus.PENDING:
        return 'bg-white/5 border-white/5 opacity-50';
      default:
        return 'bg-white/5 border-white/5';
    }
  };

  const orderGroups = groupTasksByOrder();

  return (
    <div data-testid="kitchen-status" className="flex-1 p-8 flex flex-col overflow-hidden bg-midnight/30">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-text">
          Estado de Cocina
        </h4>
        <button
          data-testid="refresh-kitchen-btn"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-primary text-sm cursor-pointer hover:rotate-180 transition-transform duration-500 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">sync</span>
        </button>
      </div>

      <div data-testid="kitchen-orders-list" className="flex-1 overflow-y-auto order-scroll space-y-4">
        {orderGroups.length === 0 ? (
          <div data-testid="kitchen-empty-state" className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-silver-text/30 mb-4 block">
              kitchen
            </span>
            <p className="text-silver-text text-sm">
              No hay tareas en cocina
            </p>
          </div>
        ) : (
          orderGroups.map((group) => {
            const progress = calculateProgress(group.tasks);
            const statusInfo = getStatusLabel(group.orderStatus);
            const containerStyle = getContainerStyle(group.orderStatus);
            const completedTasks = group.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
            const totalTasks = group.tasks.length;

            return (
              <div
                key={group.orderId}
                data-testid={`kitchen-order-${group.orderId}`}
                data-order-id={group.orderId}
                data-table-number={group.tableNumber}
                data-order-status={group.orderStatus?.status}
                className={`p-4 border rounded-2xl ${containerStyle}`}
              >
                {}
                <div className="flex justify-between items-center mb-3">
                  <span data-testid="kitchen-order-header" className="text-xs font-bold text-white-text">
                    #{group.orderId} • {group.tableNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    {group.orderStatus?.status === OrderStatus.COMPLETED ? (
                      <span className="material-symbols-outlined text-primary text-sm fill-1">
                        check_circle
                      </span>
                    ) : group.orderStatus?.status === OrderStatus.IN_PREPARATION ? (
                      <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                    ) : (
                      <div className="size-2 rounded-full bg-silver-text/40"></div>
                    )}
                    <span data-testid="kitchen-order-status" className={`text-[10px] font-bold uppercase ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {}
                <div data-testid="kitchen-order-products" className="flex flex-wrap gap-1 mb-3">
                  {group.tasks.flatMap((task) => task.products).map((product, idx) => (
                    <span
                      key={idx}
                      data-testid={`kitchen-product-${idx}`}
                      data-product-name={product.name}
                      className="text-[10px] bg-white/5 px-2 py-1 rounded text-silver-text"
                    >
                      {product.name}
                    </span>
                  ))}
                </div>

                {}
                {group.orderStatus?.status !== OrderStatus.COMPLETED && (
                  <>
                    <div data-testid="kitchen-progress-bar" className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        data-testid="kitchen-progress-fill"
                        data-progress={Math.round(progress)}
                        className="h-full gold-gradient rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p data-testid="kitchen-progress-text" className="text-[10px] text-silver-text">
                      {completedTasks} de {totalTasks} tareas completadas • {Math.round(progress)}% progreso
                    </p>
                  </>
                )}

                {}
                {group.orderStatus?.status === OrderStatus.COMPLETED && (
                  <p data-testid="kitchen-order-completed-msg" className="text-[10px] text-silver-text">
                    Recoger en estación de entrega
                  </p>
                )}

                {}
                {group.orderStatus?.status === OrderStatus.PENDING && (
                  <p data-testid="kitchen-order-pending-msg" className="text-[10px] text-silver-text">
                    Siguiente para preparación
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
