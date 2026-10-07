import { Switch } from "react-aria-components";
function SwitchComponent({
  defaultValue = false,
  isSelected = false,
  onChange = () => {},
  title = "",
  loading = false,
}) {
  return (
    <Switch
      defaultValue={defaultValue}
      isSelected={isSelected}
      onChange={onChange}
      className={() => `
                              flex items-center gap-3 select-none mt-2
                              ${
                                loading
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                            `}
    >
      {({ isSelected }) => (
        <>
          <div
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200
                                    ${
                                      isSelected ? "bg-green-600" : "bg-red-300"
                                    }
                                  `}
          >
            <div
              className={`h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-200
                                      ${
                                        isSelected
                                          ? "translate-x-6"
                                          : "translate-x-0"
                                      }
                                    `}
            />
          </div>
          <span
            className={`text-sm font-medium
                                    ${
                                      isSelected
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }
                                  `}
          >
            {title}
          </span>
        </>
      )}
    </Switch>
  );
}
export default SwitchComponent;
