import { useState, useEffect } from 'react';
import { useTables } from '../hooks/useTables';
import { useOrder } from '../hooks/useOrder';
import { useKitchenTasks } from '../hooks/useKitchenTasks';
import { TableSelector } from '../components/waiter/TableSelector';
import { CategoryFilter } from '../components/waiter/CategoryFilter';
import { ProductGrid } from '../components/waiter/ProductGrid';
import { OrderSummary } from '../components/waiter/OrderSummary';
import { KitchenStatus } from '../components/waiter/KitchenStatus';
import { ProductType } from '../models/Product';
import { MENU_PRODUCTS } from '../helpers/menuData';
import { calculateTotalPrice } from '../helpers/orderCalculator';

/**
 * Vista principal del mesero
 * Orquesta todos los componentes y la lógica de negocio
 */
export const WaiterView = () => {
  // Estado de mesas
  const {
    tables,
    selectedTable,
    selectedTableId,
    selectTable,
    markTableAsOccupied,
    syncTablesWithTasks,
  } = useTables();

  // Estado del pedido
  const {
    orderProducts,
    totalItems,
    isSubmitting,
    error,
    addProduct,
    removeProduct,
    submitOrder,
  } = useOrder();

  // Estado de cocina
  const { tasks, isLoading, refreshTasks } = useKitchenTasks();

  // Categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState<
    ProductType | 'ALL'
  >('ALL');

  // Datos del cliente
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  /**
   * Sincroniza el estado de las mesas con las tareas cada vez que cambian
   */
  useEffect(() => {
    syncTablesWithTasks(tasks);
  }, [tasks, syncTablesWithTasks]);

  /**
   * Maneja el envío del pedido
   */
  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      alert('Por favor selecciona una mesa');
      return;
    }
    if (!customerName.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }
    if (!customerEmail.trim()) {
      alert('Por favor ingresa el correo del cliente');
      return;
    }

    const response = await submitOrder(selectedTable.number, customerName.trim(), customerEmail.trim());

    if (response) {
      // Marcar mesa como ocupada
      markTableAsOccupied(selectedTable.id, response.orderId);

      // Refrescar tareas
      await refreshTasks();

      alert(
        `✅ ${response.message}\n\nMesa: ${response.tableNumber}\nTareas creadas: ${response.tasksCreated}`
      );
      setCustomerName('');
      setCustomerEmail('');
    } else if (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  const orderProductNames = orderProducts.map((p) => p.name);
  const totalPrice = calculateTotalPrice(orderProducts);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Panel Izquierdo - Mesas */}
      <TableSelector
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={selectTable}
      />

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-midnight">
        {/* Header */}
        <header className="h-24 border-b border-white/5 px-10 flex items-center justify-between shrink-0 bg-charcoal">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white-text">
                {selectedTable
                  ? `Mesa ${selectedTable.number}`
                  : 'Selecciona una Mesa'}
              </h2>
              <p className="text-silver-text text-sm">
                {selectedTable
                  ? 'Agrega productos al pedido'
                  : 'Elige una mesa de la zona activa'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-primary text-sm">
                schedule
              </span>
              <span className="text-white-text text-sm font-bold">
                {new Date().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-10 order-scroll">
          {/* Categorías */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Grid de Productos */}
          <ProductGrid
            products={MENU_PRODUCTS}
            selectedCategory={selectedCategory}
            orderProductNames={orderProductNames}
            onAddProduct={addProduct}
          />
        </div>
      </main>

      {/* Panel Derecho */}
      <aside className="w-[420px] bg-charcoal border-l border-white/5 flex flex-col shrink-0">
        {/* Resumen de Orden */}
        <OrderSummary
          products={orderProducts}
          totalItems={totalItems}
          totalPrice={totalPrice}
          isSubmitting={isSubmitting}
          customerName={customerName}
          customerEmail={customerEmail}
          onCustomerNameChange={setCustomerName}
          onCustomerEmailChange={setCustomerEmail}
          onRemoveProduct={removeProduct}
          onSubmit={handleSubmitOrder}
        />

        {/* Estado de Cocina */}
        <KitchenStatus
          tasks={tasks}
          isLoading={isLoading}
          onRefresh={refreshTasks}
        />
      </aside>
    </div>
  );
};
