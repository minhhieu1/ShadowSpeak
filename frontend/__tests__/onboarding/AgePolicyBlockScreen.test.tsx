/**
 * Tests for AgePolicyBlockScreen.
 */

import renderer from "react-test-renderer";
import AgePolicyBlockScreen from "@/features/onboarding/screens/AgePolicyBlockScreen";

describe("AgePolicyBlockScreen", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<AgePolicyBlockScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
