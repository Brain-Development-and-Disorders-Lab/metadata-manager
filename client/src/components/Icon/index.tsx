// React
import React from "react";

// Existing components and icons
import { Icon as ChakraIcon } from "@chakra-ui/react";
import { BsBarChart, BsBox, BsCalendarWeek, BsCheck, BsGraphUp, BsGrid, BsInfoCircle, BsLink45Deg, BsPencilSquare, BsPlus, BsQuestionOctagon, BsTag, BsTextareaT, BsTrash, BsX } from "react-icons/bs";

// Custom types
import { IconType } from "react-icons";

// Utility functions and libraries
import _ from "lodash";

// Define the icon set
const SYSTEM_ICONS: {[k: string]: IconType} = {
  "unknown": BsQuestionOctagon,
  "dashboard": BsBarChart,
  "entity": BsBox,
  "collection": BsGrid,
  "attribute": BsTag,
  "check": BsCheck,
  "info": BsInfoCircle,
  "add": BsPlus,
  "edit": BsPencilSquare,
  "delete": BsTrash,
  "close": BsX,
  "p_date": BsCalendarWeek,
  "p_text": BsTextareaT,
  "p_number": BsGraphUp,
  "p_url": BsLink45Deg,
};

const Icon = (props: { name: string, size?: "sm" | "md" | "lg" }) => {
  // Default to unknown icon type
  let iconComponent = SYSTEM_ICONS["unknown"];

  // Get the corresponding icon
  if (!_.isUndefined(SYSTEM_ICONS[props.name])) {
    iconComponent = SYSTEM_ICONS[props.name];
  }

  // Set the icon sizing if specified
  if (!_.isUndefined(props.size)) {
    switch (props.size) {
      case "sm":
        return (
          <ChakraIcon as={iconComponent} w={"2"} h={"2"} />
        );
      case "md":
        return (
          <ChakraIcon as={iconComponent} w={"4"} h={"4"} />
        );
      case "lg":
        return (
          <ChakraIcon as={iconComponent} w={"8"} h={"8"} />
        );
      default:
        return (
          <ChakraIcon as={iconComponent} />
        );
    }

  }

  // Return icon with default size
  return (
    <ChakraIcon as={iconComponent} />
  );
};

export default Icon;
