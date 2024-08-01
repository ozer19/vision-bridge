import React, { useEffect, useState } from "react";
import jsYaml from "js-yaml";

const App = () => {
  // State definitions
  const [configFiles, setConfigFiles] = useState([]); // Stores the YAML files to be loaded
  const [error, setError] = useState(null); // Stores any error messages

  // `useEffect` hook that runs when the component mounts
  useEffect(() => {
    // Load the config-selector.yaml file and determine which YAML files to load based on the current URL
    fetch("/config/config-selector.yaml")
      .then((response) => response.text())
      .then((yamlText) => {
        // Parse the YAML content into a JavaScript object
        const selectorConfig = jsYaml.load(yamlText);
        // Get the current URL path
        const currentUrl = window.location.pathname;
        // Select the YAML files corresponding to the current URL
        const filesToLoad = selectorConfig.datasource.urls[currentUrl] || [];
        // If multiple files are provided, convert them to an array and store them in state
        setConfigFiles(
          Array.isArray(filesToLoad) ? filesToLoad : [filesToLoad]
        );
      })
      .catch((error) => {
        // Handle errors in loading the config-selector.yaml file
        console.error("Error loading config-selector.yaml:", error);
        setError("Error loading configuration selector.");
      });
  }, []); // This `useEffect` runs only when the component first mounts

  // Second `useEffect` hook to load and process the selected YAML files
  useEffect(() => {
    if (configFiles.length > 0) {
      // Load all the YAML files and retrieve their content as text
      Promise.all(
        configFiles.map((file) =>
          fetch(`/config/${file}`).then((response) => response.text())
        )
      )
        .then((yamlTexts) => {
          // Parse all YAML files into JavaScript objects
          const configs = yamlTexts.map((text) => jsYaml.load(text));
          // Combine configurations and resolve any conflicts
          const combinedConfig = combineConfigs(configs);
          // Apply the combined and resolved configuration to the DOM
          applyConfig(combinedConfig);
        })
        .catch((error) => {
          // Handle errors in loading the YAML files
          console.error("Error loading YAML files:", error);
          setError("Error loading configuration files.");
        });
    }
  }, [configFiles]); // This `useEffect` runs whenever the `configFiles` state changes

  // Function to combine multiple configuration files and resolve conflicts
  const combineConfigs = (configs) => {
    let combinedActions = [];
    configs.forEach((config) => {
      if (config.actions) {
        // Combine all actions from the configuration files
        combinedActions = [...combinedActions, ...config.actions];
      }
    });

    // Sort actions based on their `priority` values
    combinedActions.sort((a, b) => {
      if (a.priority && b.priority) {
        return a.priority - b.priority; // Higher priority value comes first
      } else if (a.priority) {
        return -1; // If only `a` action has priority, it comes first
      } else if (b.priority) {
        return 1; // If only `b` action has priority, it comes first
      }
      return 0; // If neither action has priority, maintain the order
    });

    // Return a new configuration object with sorted actions
    return { actions: combinedActions };
  };

  // Function to apply the combined and resolved configuration actions to the DOM
  const applyConfig = (config) => {
    const actions = config.actions;

    // First apply 'replace' actions
    actions
      .filter((action) => action.type === "replace")
      .forEach((action) => {
        document.querySelectorAll(action.selector).forEach((el) => {
          console.log(
            `Replacing element ${action.selector} with new content from priority ${action.priority}`
          );
          el.outerHTML = action.newElement; // Replace the old element with the new element
        });
      });

    // Then apply 'insert' actions
    actions
      .filter((action) => action.type === "insert")
      .forEach((action) => {
        const target = document.querySelector(action.target);
        if (target) {
          console.log(
            `Inserting element after ${action.target} from priority ${action.priority}`
          );
          if (action.position === "after") {
            target.insertAdjacentHTML("afterend", action.element); // Insert the new element in the specified position
          } else if (action.position === "before") {
            target.insertAdjacentHTML("beforebegin", action.element);
          }
        }
      });

    // Apply 'remove' actions
    actions
      .filter((action) => action.type === "remove")
      .forEach((action) => {
        document.querySelectorAll(action.selector).forEach((el) => {
          console.log(`Removing element ${action.selector}`);
          el.remove(); // Remove the specified elements from the DOM
        });
      });

    // Apply 'alter' actions
    actions
      .filter((action) => action.type === "alter")
      .forEach((action) => {
        console.log(
          `Altering text from "${action.oldValue}" to "${action.newValue}"`
        );
        document.body.innerHTML = document.body.innerHTML
          .split(action.oldValue)
          .join(action.newValue); // Replace specified text in the DOM
      });
  };

  return (
    <div id="content">
      {error && <p className="error">{error}</p>}{" "}
      <nav style={{ display: "flex", gap: "10px" }}>
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/orders">Orders</a>
      </nav>
      <h1>Machine Learning</h1>
      <p className="ad-banner">This is an ad banner</p>
      <div id="old-header">Old Header</div>
    </div>
  );
};

export default App;
