import { useEffect } from "react";

const parseField = (field) => {
  return field ? field.replace(/[{}]/g, "").split(",") : [];
};

const useFormInitialization = (form, list) => {
  useEffect(() => {
    if (!list) return;

    // Parse necessary fields
    const parsedCategories = parseField(list.categories);
    const parsedPackageTypes = parseField(list.package_types);
    const parsedAgeGroups = parseField(list.age_groups);

    // Initialize form values
    form.setFieldsValue({
      title: list?.listing_title,
      credit: list?.credit,
      description: list?.description,
      package_types: parsedPackageTypes,
      category: parsedCategories,
      age_groups: parsedAgeGroups,
    });
  }, [form, list]);
};

export default useFormInitialization;
