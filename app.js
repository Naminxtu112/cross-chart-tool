"use strict";

(() => {
  const axisSets = Array.isArray(window.AXIS_SETS) ? window.AXIS_SETS : [];

  const elements = {
    startScreen: document.getElementById("start-screen"),
    editorScreen: document.getElementById("editor-screen"),
    startNumber: document.getElementById("start-set-number"),
    startButton: document.getElementById("start-button"),
    startError: document.getElementById("start-error"),
    switchSetSelect: document.getElementById("switch-set-select"),
    switchNumberButton: document.getElementById("switch-number-button"),
    switchRandomButton: document.getElementById("switch-random-button"),
    currentSetNumber: document.getElementById("current-set-number"),
    currentSetName: document.getElementById("current-set-name"),
    liveStatus: document.getElementById("live-status"),
    savePngButton: document.getElementById("save-png"),

    svg: document.getElementById("diagram"),
    itemsLayer: document.getElementById("items-layer"),
    pendingMarker: document.getElementById("pending-marker"),
    diagramTitle: document.getElementById("diagram-title"),
    diagramNumber: document.getElementById("diagram-number"),
    labelTop: document.getElementById("label-top"),
    labelBottom: document.getElementById("label-bottom"),
    labelLeft: document.getElementById("label-left"),
    labelRight: document.getElementById("label-right"),

    itemText: document.getElementById("item-text"),
    markerShape: document.getElementById("marker-shape"),
    itemColor: document.getElementById("item-color"),
    colorValue: document.getElementById("color-value"),
    commitButton: document.getElementById("commit-item"),
    deleteButton: document.getElementById("delete-item"),
    clearButton: document.getElementById("clear-items"),
    positionStatus: document.getElementById("position-status")
  };

  const state = {
    currentSet: null,
    items: [],
    pending: null,
    selectedId: null,
    draggingId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    nextId: 1
  };

  function validateAxisSets() {
    if (axisSets.length === 0) {
      elements.startButton.disabled = true;
      elements.startError.textContent = "軸セットが登録されていません。axis-sets.jsを確認してください。";
      return false;
    }

    const ids = new Set();
    const invalidSet = axisSets.find((set) => {
      const valid = Number.isInteger(set.id)
        && set.id > 0
        && typeof set.name === "string"
        && (typeof set.title === "undefined" || typeof set.title === "string")
        && typeof set.top === "string"
        && typeof set.bottom === "string"
        && typeof set.left === "string"
        && typeof set.right === "string"
        && !ids.has(set.id);

      ids.add(set.id);
      return !valid;
    });

    if (invalidSet) {
      elements.startButton.disabled = true;
      elements.startError.textContent = "axis-sets.jsの登録内容に誤りまたは番号の重複があります。";
      return false;
    }

    axisSets.forEach((set) => {
      if (typeof set.title !== "string") {
        set.title = "";
      }
    });
    axisSets.sort((a, b) => a.id - b.id);
    return true;
  }

  function axisDescription(set) {
    return `上下：${set.top}―${set.bottom} ／ 左右：${set.left}―${set.right}`;
  }

  function buildSetSelectors() {
    elements.switchSetSelect.replaceChildren();

    axisSets.forEach((set) => {
      const option = document.createElement("option");
      option.value = String(set.id);
      option.textContent = String(set.id);
      elements.switchSetSelect.appendChild(option);
    });
  }

  function findSet(id) {
    return axisSets.find((set) => set.id === Number(id));
  }

  function randomSet(excludeId = null) {
    let candidates = axisSets.filter((set) => set.id !== excludeId);
    if (candidates.length === 0) {
      candidates = axisSets;
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function setPendingMarkerVisible(visible) {
    if (visible) {
      elements.pendingMarker.removeAttribute("hidden");
    } else {
      elements.pendingMarker.setAttribute("hidden", "");
    }
  }

  function setEditingControlsEnabled(enabled) {
    elements.itemText.disabled = !enabled;
    elements.markerShape.disabled = !enabled;
    elements.itemColor.disabled = !enabled;
    elements.commitButton.disabled = !enabled;
  }

  function resetEditingControls() {
    elements.itemText.value = "";
    elements.markerShape.value = "none";
    elements.itemColor.value = "#2563eb";
    elements.colorValue.textContent = "#2563eb";
    elements.commitButton.textContent = "項目を追加";
  }

  function clearDiagramItems() {
    state.items = [];
    state.pending = null;
    state.selectedId = null;
    state.draggingId = null;
    state.nextId = 1;

    setPendingMarkerVisible(false);
    elements.deleteButton.disabled = true;
    setEditingControlsEnabled(false);
    resetEditingControls();
    elements.positionStatus.textContent = "最初に図中をクリックしてください。";
    renderItems();
  }

  function loadSet(set, message = "") {
    state.currentSet = set;
    clearDiagramItems();

    elements.currentSetNumber.textContent = String(set.id);
    elements.currentSetName.textContent = `${set.name}：${axisDescription(set)}`;
    elements.switchSetSelect.value = String(set.id);
    elements.diagramTitle.textContent = set.title;
    elements.diagramNumber.textContent = `No. ${set.id}`;
    elements.labelTop.textContent = set.top;
    elements.labelBottom.textContent = set.bottom;
    elements.labelLeft.textContent = set.left;
    elements.labelRight.textContent = set.right;

    elements.startScreen.classList.add("hidden");
    elements.editorScreen.classList.remove("hidden");
    elements.liveStatus.textContent = message || `図番号${set.id}を表示しました。`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEditor() {
    const value = elements.startNumber.value.trim();

    if (value === "") {
      loadSet(randomSet(), "ランダムに十字図を選択しました。");
      return;
    }

    const set = findSet(value);
    if (!set) {
      elements.startError.textContent = "一覧にない図番号です。番号を確認してください。";
      return;
    }

    elements.startError.textContent = "";
    loadSet(set);
  }

  function svgPoint(event) {
    const matrix = elements.svg.getScreenCTM();
    if (!matrix) {
      return { x: 450, y: 365 };
    }

    const point = elements.svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(matrix.inverse());
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function beginNewItem(x, y) {
    const safeX = clamp(x, 85, 815);
    const safeY = clamp(y, 130, 600);

    state.selectedId = null;
    state.pending = { x: safeX, y: safeY };

    setPendingMarkerVisible(true);
    elements.pendingMarker.setAttribute("transform", `translate(${safeX} ${safeY})`);

    resetEditingControls();
    setEditingControlsEnabled(true);
    elements.deleteButton.disabled = true;
    elements.positionStatus.textContent = `新規配置位置：X ${Math.round(safeX - 450)}、Y ${Math.round(365 - safeY)}`;
    elements.itemText.focus();
    renderItems();
  }

  function selectItem(id) {
    const item = state.items.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    state.selectedId = id;
    state.pending = null;
    setPendingMarkerVisible(false);

    elements.itemText.value = item.text;
    elements.markerShape.value = item.shape;
    elements.itemColor.value = item.color;
    elements.colorValue.textContent = item.color;
    elements.commitButton.textContent = "選択項目を更新";
    setEditingControlsEnabled(true);
    elements.deleteButton.disabled = false;
    elements.positionStatus.textContent = "選択した項目を編集中です。ドラッグまたは矢印キーで移動できます。";
    renderItems();
  }

  function commitItem() {
    const text = elements.itemText.value.trim();

    if (text === "") {
      elements.liveStatus.textContent = "表示する文字を入力してください。";
      return;
    }

    if (state.selectedId !== null) {
      const item = state.items.find((entry) => entry.id === state.selectedId);
      if (!item) {
        return;
      }

      item.text = text;
      item.shape = elements.markerShape.value;
      item.color = elements.itemColor.value;
      renderItems();
      elements.liveStatus.textContent = `「${text}」を更新しました。`;
      return;
    }

    if (!state.pending) {
      elements.liveStatus.textContent = "図中の配置位置をクリックしてください。";
      return;
    }

    state.items.push({
      id: state.nextId++,
      x: state.pending.x,
      y: state.pending.y,
      text,
      shape: elements.markerShape.value,
      color: elements.itemColor.value
    });

    state.pending = null;
    setPendingMarkerVisible(false);
    setEditingControlsEnabled(false);
    resetEditingControls();
    elements.positionStatus.textContent = "次の配置位置を図中でクリックしてください。";
    renderItems();
    elements.liveStatus.textContent = `「${text}」を追加しました。`;
  }

  function makeSvgElement(name, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function createMarker(item) {
    const color = item.color;

    switch (item.shape) {
      case "none":
        return null;
      case "circle":
        return makeSvgElement("circle", { r: 7, fill: color, stroke: color });
      case "circle-open":
        return makeSvgElement("circle", {
          r: 8,
          fill: "none",
          stroke: color,
          "stroke-width": 3
        });
      case "square":
        return makeSvgElement("rect", {
          x: -7,
          y: -7,
          width: 14,
          height: 14,
          fill: color,
          stroke: color
        });
      case "triangle":
        return makeSvgElement("polygon", {
          points: "0,-9 9,8 -9,8",
          fill: color,
          stroke: color
        });
      case "diamond":
        return makeSvgElement("polygon", {
          points: "0,-10 10,0 0,10 -10,0",
          fill: color,
          stroke: color
        });
      case "star":
        return makeSvgElement("path", {
          d: "M0,-11 L3,-4 L10,-4 L5,1 L7,9 L0,5 L-7,9 L-5,1 L-10,-4 L-3,-4 Z",
          fill: color,
          stroke: color
        });
      default:
        return null;
    }
  }

  function renderItems() {
    elements.itemsLayer.replaceChildren();

    state.items.forEach((item) => {
      const group = makeSvgElement("g", {
        class: "diagram-item",
        transform: `translate(${item.x} ${item.y})`
      });
      group.dataset.id = String(item.id);

      if (state.selectedId === item.id) {
        group.appendChild(makeSvgElement("circle", {
          class: "selection-ring",
          r: 15
        }));
      }

      const marker = createMarker(item);
      if (marker) {
        group.appendChild(marker);
      }

      const text = makeSvgElement("text", {
        x: item.shape === "none" ? 0 : 16,
        y: item.shape === "none" ? 0 : -11,
        fill: item.color,
        "dominant-baseline": item.shape === "none" ? "middle" : "middle"
      });
      text.textContent = item.text;
      group.appendChild(text);

      elements.itemsLayer.appendChild(group);
    });
  }

  function deleteSelected() {
    if (state.selectedId === null) {
      return;
    }

    state.items = state.items.filter((item) => item.id !== state.selectedId);
    state.selectedId = null;
    setEditingControlsEnabled(false);
    resetEditingControls();
    elements.deleteButton.disabled = true;
    elements.positionStatus.textContent = "図中をクリックして次の項目を追加してください。";
    renderItems();
    elements.liveStatus.textContent = "選択項目を削除しました。";
  }

  function moveSelectedItem(dx, dy, step) {
    if (state.selectedId === null) {
      return;
    }

    const item = state.items.find((entry) => entry.id === state.selectedId);
    if (!item) {
      return;
    }

    item.x = clamp(item.x + dx * step, 85, 815);
    item.y = clamp(item.y + dy * step, 130, 600);
    renderItems();
  }

  function createExportSvg() {
    const clone = elements.svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "1800");
    clone.setAttribute("height", "1360");
    clone.removeAttribute("class");

    clone.querySelector("#pending-marker")?.remove();
    clone.querySelectorAll(".selection-ring").forEach((node) => node.remove());

    const background = clone.querySelector("#diagram-background");
    background?.setAttribute("fill", "#ffffff");

    const axes = clone.querySelector("#axes");
    axes?.setAttribute("stroke", "#111111");
    axes?.setAttribute("fill", "#111111");
    axes?.setAttribute("color", "#111111");

    clone.querySelectorAll("#arrow path").forEach((node) => {
      node.setAttribute("fill", "#111111");
    });

    clone.querySelector("#diagram-title")?.setAttribute("fill", "#111111");
    clone.querySelector("#diagram-number")?.setAttribute("fill", "#555555");
    clone.querySelectorAll("#axis-labels text").forEach((node) => {
      node.setAttribute("fill", "#111111");
    });

    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `
      #axes line { stroke-width: 2.5; }
      #axes circle { fill: #111111; stroke: #111111; }
      #diagram-title {
        font-family: "Yomogi", "Comic Sans MS", cursive;
        font-size: 28px;
        font-weight: 400;
      }
      #diagram-number {
        font-family: "Yomogi", "Comic Sans MS", cursive;
        font-size: 20px;
        font-weight: 400;
      }
      #axis-labels text {
        font-family: "Yomogi", "Comic Sans MS", cursive;
        font-size: 24px;
        font-weight: 400;
      }
      .diagram-item text {
        font-family: "Yomogi", "Comic Sans MS", cursive;
        font-size: 22px;
      }
    `;
    clone.insertBefore(style, clone.firstChild);

    return clone;
  }

  function showSaveFailure() {
    elements.liveStatus.textContent = "お使いの端末では画像を保存できませんでした。申し訳ありませんが、画面をスクリーンショットして保存してください。";
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function savePng() {
    if (!state.currentSet) {
      showSaveFailure();
      return;
    }

    elements.liveStatus.textContent = "画像を作成しています。";

    try {
      const exportedSvg = createExportSvg();
      const source = new XMLSerializer().serializeToString(exportedSvg);
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1800;
          canvas.height = 1360;
          const context = canvas.getContext("2d");

          if (!context) {
            URL.revokeObjectURL(svgUrl);
            showSaveFailure();
            return;
          }

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(svgUrl);

          canvas.toBlob((blob) => {
            if (!blob) {
              showSaveFailure();
              return;
            }

            const number = String(state.currentSet.id).padStart(2, "0");
            downloadBlob(blob, `cross-chart_set-${number}.png`);
            elements.liveStatus.textContent = "画像を保存しました。";
          }, "image/png");
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          showSaveFailure();
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        showSaveFailure();
      };

      image.src = svgUrl;
    } catch (error) {
      showSaveFailure();
    }
  }

  elements.startButton.addEventListener("click", startEditor);
  elements.startNumber.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startEditor();
    }
  });

  elements.switchNumberButton.addEventListener("click", () => {
    const set = findSet(elements.switchSetSelect.value);
    if (set) {
      loadSet(set, `図番号${set.id}に切り替えました。`);
    }
  });

  elements.switchRandomButton.addEventListener("click", () => {
    const set = randomSet(state.currentSet?.id ?? null);
    loadSet(set, `図番号${set.id}へランダムに切り替えました。`);
  });

  elements.itemColor.addEventListener("input", () => {
    elements.colorValue.textContent = elements.itemColor.value;
  });

  elements.svg.addEventListener("pointerdown", (event) => {
    const group = event.target.closest(".diagram-item");

    if (group) {
      const id = Number(group.dataset.id);
      selectItem(id);

      const item = state.items.find((entry) => entry.id === id);
      if (!item) {
        return;
      }

      const point = svgPoint(event);
      state.draggingId = id;
      state.dragOffsetX = point.x - item.x;
      state.dragOffsetY = point.y - item.y;
      elements.svg.setPointerCapture(event.pointerId);
      return;
    }

    const point = svgPoint(event);
    beginNewItem(point.x, point.y);
  });

  elements.svg.addEventListener("pointermove", (event) => {
    if (state.draggingId === null) {
      return;
    }

    const point = svgPoint(event);
    const item = state.items.find((entry) => entry.id === state.draggingId);
    if (!item) {
      return;
    }

    item.x = clamp(point.x - state.dragOffsetX, 85, 815);
    item.y = clamp(point.y - state.dragOffsetY, 130, 600);
    renderItems();
  });

  function endDragging(event) {
    state.draggingId = null;
    if (elements.svg.hasPointerCapture(event.pointerId)) {
      elements.svg.releasePointerCapture(event.pointerId);
    }
  }

  elements.svg.addEventListener("pointerup", endDragging);
  elements.svg.addEventListener("pointercancel", endDragging);

  elements.commitButton.addEventListener("click", commitItem);
  elements.itemText.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitItem();
    }
  });

  elements.deleteButton.addEventListener("click", deleteSelected);
  elements.clearButton.addEventListener("click", () => {
    clearDiagramItems();
    elements.liveStatus.textContent = "配置内容をすべて消去しました。";
  });

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    if (activeTag === "INPUT" || activeTag === "SELECT" || activeTag === "TEXTAREA") {
      return;
    }

    if (state.selectedId === null) {
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
      return;
    }

    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };

    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      moveSelectedItem(direction[0], direction[1], event.shiftKey ? 10 : 2);
    }
  });

  elements.savePngButton.addEventListener("click", savePng);

  if (validateAxisSets()) {
    buildSetSelectors();
  }
})();
