import React, { Dispatch, SetStateAction } from "react";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { SmallAddIcon } from "@chakra-ui/icons";
import { AiOutlineBlock, AiOutlineLink } from "react-icons/ai";
import { MdDateRange, MdOutlineTextFields } from "react-icons/md";
import { RiNumbersLine } from "react-icons/ri";

import _ from "underscore";

// Custom types and components
import { Parameters } from "types";
import { DateParameter, EntityParameter, NumberParameter, StringParameter, URLParameter } from "../Parameter";

/**
 * ParameterGroup component use to display a collection of Parameters and enable
 * creating and deleting Parameters. Displays collection as cards.
 * @param props collection of props to construct component
 * @return
 */
const ParameterGroup = (props: { parameters: Parameters[], viewOnly: boolean, setParameters?: Dispatch<SetStateAction<Parameters[]>> }) => {
  const onUpdate = (data: Parameters) => {
    // Store the received Parameter information
    props.setParameters &&
      props.setParameters(
        props.parameters.filter((parameter) => {
          // Get the relevant Parameter
          if (parameter.identifier === data.identifier) {
            parameter.name = data.name;
            parameter.data = data.data;
          }
          return parameter;
        })
      );
  };

  const onRemove = (identifier: string) => {
    props.setParameters &&
      props.setParameters(props.parameters.filter((parameter) => {
        // Filter out the Parameter to be removed
        if (!_.isEqual(parameter.identifier, identifier)) {
          return parameter;
        } else {
          return;
        }
      }));
  };

  return (
    <Flex direction={"column"} gap={"4"} w={"3xl"} maxW={"3xl"}>
      {/* Button Group */}
      {!props.viewOnly &&
        <Flex direction={"row"} gap={"2"} flexWrap={"wrap"} justify={"center"} align={"center"}>
          {/* Buttons to add Parameters */}
          <Button
            leftIcon={<Icon as={MdDateRange} />}
            rightIcon={<SmallAddIcon />}
            onClick={() => {
              // Create an 'empty' attribute and add the data structure to the 'attributeData' collection
              props.setParameters &&
                props.setParameters([
                  ...props.parameters,
                  {
                    identifier: `p_date_${Math.round(performance.now())}`,
                    name: "",
                    type: "date",
                    data: new Date(),
                  },
                ]);
            }}
          >
            Date
          </Button>

          <Button
            leftIcon={<Icon as={MdOutlineTextFields} />}
            rightIcon={<SmallAddIcon />}
            onClick={() => {
              // Create an 'empty' attribute and add the data structure to the 'attributeData' collection
              props.setParameters &&
                props.setParameters([
                  ...props.parameters,
                  {
                    identifier: `p_string_${Math.round(performance.now())}`,
                    name: "",
                    type: "string",
                    data: "",
                  },
                ]);
            }}
          >
            String
          </Button>

          <Button
            leftIcon={<Icon as={RiNumbersLine} />}
            rightIcon={<SmallAddIcon />}
            onClick={() => {
              // Create an 'empty' attribute and add the data structure to the 'attributeData' collection
              props.setParameters &&
                props.setParameters([
                  ...props.parameters,
                  {
                    identifier: `p_number_${Math.round(performance.now())}`,
                    name: "",
                    type: "number",
                    data: 0,
                  },
                ]);
            }}
          >
            Number
          </Button>

          <Button
            leftIcon={<Icon as={AiOutlineLink} />}
            rightIcon={<SmallAddIcon />}
            onClick={() => {
              // Create an 'empty' attribute and add the data structure to the 'attributeData' collection
              props.setParameters &&
                props.setParameters([
                  ...props.parameters,
                  {
                    identifier: `p_url_${Math.round(performance.now())}`,
                    name: "",
                    type: "url",
                    data: "",
                  },
                ]);
            }}
          >
            URL
          </Button>

          <Button
            leftIcon={<Icon as={AiOutlineBlock} />}
            rightIcon={<SmallAddIcon />}
            onClick={() => {
              // Create an 'empty' attribute and add the data structure to the 'attributeData' collection
              props.setParameters &&
                props.setParameters([
                  ...props.parameters,
                  {
                    identifier: `p_entity_${Math.round(performance.now())}`,
                    name: "",
                    type: "entity",
                    data: "",
                  },
                ]);
            }}
          >
            Entity
          </Button>
        </Flex>
      }

      {/* Card Group */}
      <Flex p={"2"} margin={"2"} direction={"row"} gap={"4"} wrap={"wrap"} rounded={"xl"} border={"1px"} borderColor={"gray.200"} minH={"xs"} justify={"center"} align={"center"} maxW={"inherit"}>
        <Flex direction={"row"} overflowX={"auto"} gap={"2"} p={"2"} maxW={"inherit"}>
          {props.parameters.length > 0 ?
            props.parameters.map((parameter) => {
              switch (parameter.type) {
                case "date": {
                  return (
                    <DateParameter
                      key={parameter.identifier}
                      identifier={parameter.identifier}
                      name={parameter.name}
                      type={"date"}
                      data={parameter.data}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      disabled={props.viewOnly}
                      showRemove
                    />
                  );
                }
                case "entity": {
                  return (
                    <EntityParameter
                      key={parameter.identifier}
                      identifier={parameter.identifier}
                      name={parameter.name}
                      type={"entity"}
                      data={parameter.data}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      disabled={props.viewOnly}
                      showRemove
                    />
                  );
                }
                case "number": {
                  return (
                    <NumberParameter
                      key={parameter.identifier}
                      identifier={parameter.identifier}
                      name={parameter.name}
                      type={"number"}
                      data={parameter.data}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      disabled={props.viewOnly}
                      showRemove
                    />
                  );
                }
                case "url": {
                  return (
                    <URLParameter
                      key={parameter.identifier}
                      identifier={parameter.identifier}
                      name={parameter.name}
                      type={"url"}
                      data={parameter.data}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      disabled={props.viewOnly}
                      showRemove
                    />
                  );
                }
                default: {
                  return (
                    <StringParameter
                      key={parameter.identifier}
                      identifier={parameter.identifier}
                      name={parameter.name}
                      type={"string"}
                      data={parameter.data}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      disabled={props.viewOnly}
                      showRemove
                    />
                  );
                }
              }
            })
          :
            <Text>No Parameters specified. Use the buttons above to add a new Parameter.</Text>
          }
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ParameterGroup;
