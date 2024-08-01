### `clone repository`

### `npm install`

### `npm start`

### `code structure`

The App.js file in this React application is responsible for dynamically modifying the DOM based on configurations specified in YAML files.

State Management:
configFiles: A state variable to store the list of YAML files that need to be loaded based on the current URL.
Initial Configuration Setup (useEffect #1):
When the component mounts, it fetches the config-selector.yaml file to determine which YAML files should be loaded based on the current URL.
The YAML content is parsed into a JavaScript object, and the corresponding YAML files for the URL are stored in the configFiles state.
Loading and Processing YAML Files (useEffect #2):
When the configFiles state changes, indicating which YAML files to load, this effect fetches the content of each specified YAML file.
The YAML files are parsed, combined, and any conflicts between actions are resolved based on their priority.
Combining and Sorting Configurations (combineConfigs):
This function takes multiple YAML configurations and combines their actions into a single list.
The actions are sorted by their priority value, ensuring that higher-priority actions are applied first.
Applying Configurations to the DOM (applyConfig):
The combined and sorted actions are applied to the DOM:
Replace: Replaces existing DOM elements with new ones based on the provided selector.
Insert: Inserts new elements into the DOM at specified positions relative to target elements.
Remove: Removes elements from the DOM based on the provided selector.
Alter: Changes text content within the DOM by replacing occurrences of specified strings.
Rendering Initial HTML Structure

### `assumptions and limitations`

The application assumes that YAML files are correctly formatted and follow the expected structure, including valid actions and priority values.
config-selector.yaml is required and should accurately map URLs to the corresponding YAML configuration files.
The application currently supports the specified actions (remove, replace, insert, alter) but does not handle more advanced DOM manipulations.
Error handling for YAML parsing is basic, with no advanced validation.
The application is designed for a development environment; additional configuration may be necessary for production deployment.
