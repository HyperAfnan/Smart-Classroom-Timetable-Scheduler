import {
  selectThemeMode,
  selectResolvedTheme,
  setMode,
  toggleMode,
} from "@/Store/theme.js";
import { useDispatch, useSelector } from "react-redux";

export default function useTheme() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);
  const resolvedMode = useSelector(selectResolvedTheme);

  return {
    mode,
    resolvedMode,
    setMode: (value) => dispatch(setMode(value)),
    toggleMode: () => dispatch(toggleMode()),
  };
}
