const filtersList = document.getElementById("filters-list");
const addFilterButton = document.getElementById("add-filter");
const resetFiltersButton = document.getElementById("reset-filters");
const queryPreview = document.getElementById("query-preview");
const resultsContainer = document.getElementById("results");
const resultsCount = document.getElementById("results-count");

const operatorOptions = {
  keyword: ["contains", "does not contain"],
  agency: ["is", "is not", "contains"],
  category: ["is", "is not"],
  salary: ["between", ">=", "<="] ,
  date: ["after", "before", "on"],
  location: ["is", "is not", "contains"],
  type: ["is", "is not"],
  level: ["is", "is not"],
  schedule: ["is", "is not"],
};

const sampleJobs = [
  {
    title: "Program Manager, Community Affairs",
    agency: "Mayor's Office",
    location: "Manhattan",
    level: "Manager",
    type: "Full-time",
    salary: "$82,000 - $95,000",
  },
  {
    title: "Data Analyst",
    agency: "Department of Health",
    location: "Queens",
    level: "Mid-level",
    type: "Full-time",
    salary: "$76,500 - $88,000",
  },
  {
    title: "Civil Engineer",
    agency: "Department of Transportation",
    location: "Brooklyn",
    level: "Senior",
    type: "Full-time",
    salary: "$98,000 - $120,000",
  },
];

const createFilterId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return `filter-${id}`;
  };
})();

const buildOperatorOptions = (operatorSelect, field) => {
  operatorSelect.innerHTML = "";
  operatorOptions[field].forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    operatorSelect.appendChild(opt);
  });
};

const updateInputType = (filterElement, field) => {
  const input = filterElement.querySelector(".filter__input");
  const wrapper = filterElement.querySelector(".filter__value");

  input.type = "text";
  input.placeholder = "Add a value";

  if (field === "salary") {
    input.type = "text";
    input.placeholder = "e.g. 70000 - 90000";
  }

  if (field === "date") {
    input.type = "date";
  }

  wrapper.querySelector("span")?.remove();
};

const addFilter = (defaults = {}) => {
  const template = document.getElementById("filter-template");
  const filterElement = template.content.firstElementChild.cloneNode(true);
  const filterId = createFilterId();

  filterElement.dataset.filterId = filterId;

  const fieldSelect = filterElement.querySelector(".filter__field");
  const operatorSelect = filterElement.querySelector(".filter__operator");
  const input = filterElement.querySelector(".filter__input");
  const removeButton = filterElement.querySelector(".filter__remove");

  fieldSelect.value = defaults.field || "keyword";
  buildOperatorOptions(operatorSelect, fieldSelect.value);
  operatorSelect.value = defaults.operator || operatorSelect.options[0].value;
  input.value = defaults.value || "";
  updateInputType(filterElement, fieldSelect.value);

  fieldSelect.addEventListener("change", () => {
    buildOperatorOptions(operatorSelect, fieldSelect.value);
    updateInputType(filterElement, fieldSelect.value);
    updatePreview();
  });

  operatorSelect.addEventListener("change", updatePreview);
  input.addEventListener("input", updatePreview);

  removeButton.addEventListener("click", () => {
    filterElement.remove();
    updatePreview();
  });

  filtersList.appendChild(filterElement);
};

const getFilters = () => {
  return Array.from(filtersList.children).map((filter) => {
    return {
      field: filter.querySelector(".filter__field").value,
      operator: filter.querySelector(".filter__operator").value,
      value: filter.querySelector(".filter__input").value.trim(),
    };
  });
};

const updatePreview = () => {
  const filters = getFilters();
  if (!filters.length) {
    queryPreview.textContent = "Add filters to generate a query preview.";
    resultsContainer.innerHTML = "";
    resultsCount.textContent = "0 matches";
    return;
  }

  const filterDescriptions = filters.map((filter) => {
    const value = filter.value || "(any value)";
    return `${filter.field} ${filter.operator} ${value}`;
  });

  queryPreview.textContent = filterDescriptions.join(" AND ");
  renderResults(filters);
};

const getFieldValue = (job, field) => {
  if (field === "keyword") {
    return `${job.title} ${job.agency} ${job.location}`;
  }

  if (field === "salary") {
    return job.salary;
  }

  return job[field] || "";
};

const renderResults = (filters) => {
  resultsContainer.innerHTML = "";
  const matches = sampleJobs.filter((job) => {
    return filters.every((filter) => {
      if (!filter.value) {
        return true;
      }

      const fieldValue = getFieldValue(job, filter.field);
      const normalizedField = fieldValue.toLowerCase();
      const normalizedValue = filter.value.toLowerCase();

      if (filter.operator === "contains") {
        return normalizedField.includes(normalizedValue);
      }

      if (filter.operator === "does not contain") {
        return !normalizedField.includes(normalizedValue);
      }

      if (filter.operator === "is") {
        return normalizedField === normalizedValue;
      }

      if (filter.operator === "is not") {
        return normalizedField !== normalizedValue;
      }

      return true;
    });
  });

  matches.forEach((job) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <h3>${job.title}</h3>
      <div class="result-meta">
        <span>${job.agency}</span>
        <span>${job.location}</span>
        <span>${job.level}</span>
        <span>${job.type}</span>
      </div>
      <strong>${job.salary}</strong>
    `;
    resultsContainer.appendChild(card);
  });

  resultsCount.textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}`;
};

addFilter({ field: "keyword", operator: "contains", value: "" });
addFilter({ field: "agency", operator: "is", value: "" });

addFilterButton.addEventListener("click", () => {
  addFilter();
  updatePreview();
});

resetFiltersButton.addEventListener("click", () => {
  filtersList.innerHTML = "";
  addFilter({ field: "keyword", operator: "contains", value: "" });
  updatePreview();
});

const filtersForm = document.getElementById("filters-form");
filtersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updatePreview();
});

updatePreview();
