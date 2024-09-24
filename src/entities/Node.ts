import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from "typeorm";

@Entity("nodes")
@Tree("closure-table")
export class Node {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({
        type: "enum",
        enum: ["LOCATION", "DEPARTMENT", "EMPLOYEE", "ORGANIZATION"],
        default: "EMPLOYEE",
    })
    type: string;

    @Column({ type: "varchar", length: 7, default: "#FFFFFF" })
    color: string;

    @TreeParent({ onDelete: "CASCADE" }) // Automatically delete children if the parent is deleted
    parent: Node;

    @TreeChildren({ cascade: ["remove"] }) // Use cascade for removal of children
    children: Node[];
}
