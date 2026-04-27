import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./InventoryAudit.css";

function InventoryAudit() {
  const [products, setProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = "en-PH";
    window.speechSynthesis.speak(utterance);
  };

  const handleRecordAudit = (productId, physicalCount) => {
    if (physicalCount === "" || physicalCount < 0) return;

    const product = products.find((item) => item._id === productId);
    const count = parseInt(physicalCount, 10);
    const variance = count - product.stock;

    const newLog = {
      name: product.name,
      system: product.stock,
      physical: count,
      variance,
      time: new Date().toLocaleTimeString(),
    };

    setAuditLogs((currentLogs) => [newLog, ...currentLogs]);

    const feedbackText =
      variance === 0
        ? `Recorded ${product.name}. Stock is perfect.`
        : `Recorded ${product.name}. Variance is ${variance}.`;
    speak(feedbackText);
  };

  const startVoiceCommand = (productId, productName) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-PH";
    speak(`Counting ${productName}`);
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      const numberMatch = speechResult.match(/\d+/);
      if (numberMatch) handleRecordAudit(productId, numberMatch[0]);
    };
    recognition.start();
  };

  const lowStockItems = products.filter(
    (product) => product.stock > 0 && product.stock <= 10
  ).length;
  const outOfStockItems = products.filter((product) => product.stock === 0).length;

  return (
    <div className="inventory-audit-section animate-slide-up">
      <header className="audit-header-fancy">
        <div className="welcome-section">
          <h1>Inventory Audit</h1>
        </div>
        <div className="audit-stats-container">
          <div
            className="mini-stat"
            onClick={() => speak(`Total items in inventory is ${products.length}`)}
          >
            <span className="label">Total Items</span>
            <span className="value">{products.length}</span>
          </div>
          <div
            className="mini-stat warning"
            onClick={() => speak(`You have ${lowStockItems} low stock items`)}
          >
            <span className="label">Low Stock</span>
            <span className="value">{lowStockItems}</span>
          </div>
          <div
            className="mini-stat danger"
            onClick={() =>
              speak(`There are ${outOfStockItems} items out of stock`)
            }
          >
            <span className="label">Out of Stock</span>
            <span className="value">{outOfStockItems}</span>
          </div>
        </div>
      </header>

      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="text-center">Stock Record</th>
              <th className="text-center">Status</th>
              <th>Physical Count (Observe)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isOut = product.stock === 0;
              const isLow = product.stock > 0 && product.stock <= 10;

              return (
                <tr
                  key={product._id}
                  className={isOut ? "row-out" : isLow ? "row-low" : ""}
                >
                  <td>
                    <div className="p-cell">
                      <div className="p-icon">{product.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div
                          className="p-name"
                          onClick={() =>
                            speak(
                              `${product.name} stock is ${product.stock} status is ${
                                isOut ? "empty" : isLow ? "low stock" : "in stock"
                              }`
                            )
                          }
                        >
                          {product.name}
                        </div>
                        <div className="p-category">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="accounting-count">{product.stock}</span>
                  </td>
                  <td className="text-center">
                    <span
                      className={`status-pill ${
                        isOut ? "pill-danger" : isLow ? "pill-warning" : "pill-success"
                      }`}
                    >
                      {isOut ? "Empty" : isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td>
                    <div className="audit-input-group">
                      <input
                        type="number"
                        placeholder="Counted"
                        className="audit-qty-field"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        onKeyDown={(e) => {
                          const allowedKeys = [
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                            "Enter",
                          ];

                          if (
                            !allowedKeys.includes(e.key) &&
                            !/^\d$/.test(e.key)
                          ) {
                            e.preventDefault();
                            return;
                          }

                          if (e.key === "Enter") {
                            handleRecordAudit(product._id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        onPaste={(e) => {
                          const pastedText = e.clipboardData.getData("text");
                          if (!/^\d+$/.test(pastedText)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <button
                        className="voice-mic-btn"
                        onClick={() => startVoiceCommand(product._id, product.name)}
                        aria-label={`Start voice count for ${product.name}`}
                      >
                        
                      </button>
                      <button
                        className="audit-sync-btn"
                        onClick={(e) => {
                          const input = e.currentTarget.parentNode.querySelector("input");
                          handleRecordAudit(product._id, input.value);
                          input.value = "";
                        }}
                      >
                        Record
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="variance-history">
        <h3>Variance Record List</h3>
        <table className="variance-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Product</th>
              <th>Stocks</th>
              <th>Counted</th>
              <th>Variance</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.time}</td>
                <td>{log.name}</td>
                <td>{log.system}</td>
                <td>{log.physical}</td>
                <td
                  className={
                    log.variance < 0
                      ? "variance-negative"
                      : log.variance > 0
                      ? "variance-positive"
                      : "variance-neutral"
                  }
                >
                  {log.variance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryAudit;
