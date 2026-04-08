import { useState, useEffect } from 'react';
import { useTables } from '../hooks/useTables';
import { useOrder } from '../hooks/useOrder';
import { useKitchenTasks } from '../hooks/useKitchenTasks';
import { useCatalog } from '../hooks/useCatalog';
import { TableSelector } from '../components/waiter/TableSelector';
import { CategoryFilter } from '../components/waiter/CategoryFilter';
import { ProductGrid } from '../components/waiter/ProductGrid';
import { OrderSummary } from '../components/waiter/OrderSummary';
import { KitchenStatus } from '../components/waiter/KitchenStatus';
import { calculateTotalPrice } from '../helpers/orderCalculator';

export const WaiterView = () => {

  const {
    tables,
    selectedTable,
    selectedTableId,
    selectTable,
    markTableAsOccupied,
    syncTablesWithTasks,
  } = useTables();

  const {
    orderProducts,
    totalItems,
    isSubmitting,
    error,
    addProduct,
    removeProduct,
    submitOrder,
  } = useOrder();

  const { tasks, isLoading, refreshTasks } = useKitchenTasks();

  const {
    products: catalogProducts,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    isLoading: isCatalogLoading,
  } = useCatalog();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    syncTablesWithTasks(tasks);
  }, [tasks, syncTablesWithTasks]);

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

      markTableAsOccupied(selectedTable.id, response.orderId);

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
      {}
      <TableSelector
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={selectTable}
      />

      {}
      <main className="flex-1 flex flex-col overflow-hidden bg-midnight">
        {}
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

        {}
        <div className="flex-1 overflow-y-auto p-10 order-scroll">
          {}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-silver-text text-xl">search</span>
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal border border-white/10 text-white-text placeholder-silver-text text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {}
          {isCatalogLoading && (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
            </div>
          )}

          {}
          {!isCatalogLoading && (
            <ProductGrid
              products={catalogProducts}
              selectedCategory="ALL"
              orderProductNames={orderProductNames}
              onAddProduct={addProduct}
            />
          )}
        </div>
      </main>

      {}
      <aside className="w-[420px] bg-charcoal border-l border-white/5 flex flex-col shrink-0">
        {}
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

        {}
        <KitchenStatus
          tasks={tasks}
          isLoading={isLoading}
          onRefresh={refreshTasks}
        />
      </aside>
    </div>
  );
};
